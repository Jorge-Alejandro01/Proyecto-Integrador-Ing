pipeline {
    agent any

    environment {
        BLUE_PORT = "3000"
        GREEN_PORT = "3001"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Jorge-Alejandro01/Proyecto-Integrador-Ing.git'
            }
        }

        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Deploy to Inactive') {
            steps {
                script {
                    def activePort = sh(returnStdout: true, script: "grep 'proxy_pass' /etc/nginx/sites-available/default | grep -o '[0-9]*'").trim()
                    def targetPort = (activePort == env.BLUE_PORT) ? env.GREEN_PORT : env.BLUE_PORT

                    sh "fuser -k ${targetPort}/tcp || true"

                    sh "nohup npm start -p ${targetPort} > app_${targetPort}.log 2>&1 &"
                }
            }
        }

        stage('Switch Traffic') {
            steps {
                script {
                    def activePort = sh(returnStdout: true, script: "grep 'proxy_pass' /etc/nginx/sites-available/default | grep -o '[0-9]*'").trim()
                    def targetPort = (activePort == env.BLUE_PORT) ? env.GREEN_PORT : env.BLUE_PORT

                    // Cambiamos configuración de Nginx para apuntar al target
                    sh """
                        sudo sed -i 's/${activePort}/${targetPort}/' /etc/nginx/sites-available/default
                        sudo systemctl reload nginx
                    """
                }
            }
        }
    }
}
