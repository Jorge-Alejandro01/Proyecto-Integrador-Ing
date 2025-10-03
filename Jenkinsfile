pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "mi-app"             // Nombre de la imagen
        CONTAINER_NAME = "mi-app-container" // Nombre del contenedor
        PORT = "3000"                       // Puerto donde correrá la app
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Clonando el repositorio desde GitHub..."
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Construyendo la imagen Docker..."
                script {
                    sh "docker build -t ${DOCKER_IMAGE}:latest ."
                }
            }
        }

        stage('Stop Old Container') {
            steps {
                echo "Deteniendo y eliminando contenedor anterior (si existe)..."
                script {
                    // Esto asegura que no choque con uno viejo
                    sh "docker rm -f ${CONTAINER_NAME} || true"
                }
            }
        }

        stage('Run New Container') {
            steps {
                echo "Levantando nuevo contenedor..."
                script {
                    sh "docker run -d --name ${CONTAINER_NAME} -p ${PORT}:${PORT} ${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Verify Container') {
            steps {
                echo "Mostrando contenedores en ejecución..."
                script {
                    sh "docker ps"
                }
            }
        }
    }

    post {
        success {
            echo "✅ Despliegue exitoso: la app está corriendo en http://localhost:${PORT}"
        }
        failure {
            echo "❌ Error durante el despliegue"
        }
    }
}
