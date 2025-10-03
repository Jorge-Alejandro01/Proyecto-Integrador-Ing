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
                bat 'docker build -t mi-app .'
            }
        }

        stage('Detener contenedor anterior') {
            steps {
                bat '''
                if [ $(docker ps -q --filter "name=mi-app-container") ]; then
                    docker stop mi-app-container
                    docker rm mi-app-container
                fi
                '''
            }
        }

        stage('Ejecutar contenedor Docker') {
            steps {
                bat 'docker run -d -p 3000:3000 --name mi-app-container mi-app'
            }
        }
    }
}

