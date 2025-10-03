pipeline {
    agent any

    stages {
        stage('Clonar repositorio') {
            steps {
                git branch: 'main', url: 'https://github.com/Jorge-Alejandro01/Proyecto-Integrador-Ing.git'
            }
        }

        stage('Construir imagen Docker') {
            steps {
                sh 'docker build -t mi-app .'
            }
        }

        stage('Detener contenedor anterior') {
            steps {
                sh '''
                if [ $(docker ps -q --filter "name=mi-app-container") ]; then
                    docker stop mi-app-container
                    docker rm mi-app-container
                fi
                '''
            }
        }

        stage('Ejecutar contenedor Docker') {
            steps {
                sh 'docker run -d -p 3000:3000 --name mi-app-container mi-app'
            }
        }
    }
}

