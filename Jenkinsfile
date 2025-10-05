pipeline {
    agent any

    environment {
        IMAGE_NAME = "mi-app"
        CONTAINER_NAME = "mi-app-container"
    }

    stages {

        stage('Clonar repositorio') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-token',
                    url: 'https://github.com/Jorge-Alejandro01/Proyecto-Integrador-Ing.git'
            }
        }

        stage('Construir imagen Docker') {
            steps {
                script {
                    echo "Construyendo la imagen Docker..."
                    bat 'docker build -t %IMAGE_NAME% .'
                }
            }
        }

        stage('Detener contenedor anterior') {
            steps {
                script {
                    echo "Verificando si existe un contenedor previo..."
                    bat """
                    for /f "tokens=*" %%i in ('docker ps -aq -f "name=%CONTAINER_NAME%"') do (
                        echo Deteniendo contenedor anterior...
                        docker stop %CONTAINER_NAME%
                        docker rm %CONTAINER_NAME%
                    )
                    """
                }
            }
        }

        stage('Ejecutar contenedor') {
            steps {
                script {
                    echo "Iniciando nueva versión de la aplicación..."
                    bat 'docker run -d -p 3000:3000 --name %CONTAINER_NAME% %IMAGE_NAME%'
                }
            }
        }
    }

    post {
        success {
            echo "✅ Despliegue completado correctamente en Docker."
        }
        failure {
            echo "❌ Error en el pipeline. Revisa los logs de Jenkins."
        }
    }
}

