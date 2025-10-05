pipeline {
    agent any

    environment {
        IMAGE_NAME = "mi-app"
        CONTAINER_NAME = "mi-app-container"
    }

    stages {

        stage('Clonar repositorio') {
            steps {
                echo "📥 Clonando repositorio desde GitHub..."
                git branch: 'main',
                    credentialsId: 'github-token',
                    url: 'https://github.com/Jorge-Alejandro01/Proyecto-Integrador-Ing.git'
            }
        }

        stage('Construir imagen Docker') {
            steps {
                script {
                    echo "🐳 Construyendo la imagen Docker..."
                    bat "docker build -t %IMAGE_NAME% ."
                }
            }
        }

        stage('Detener contenedor anterior (si existe)') {
            steps {
                script {
                    echo "🧹 Revisando si hay un contenedor previo..."
                    bat '''
                        echo Verificando contenedor existente...
                        for /f "delims=" %%i in ('docker ps -aq -f "name=%CONTAINER_NAME%"') do set FOUND=1
                        if defined FOUND (
                            echo Contenedor encontrado, deteniendo y eliminando...
                            docker stop %CONTAINER_NAME% || exit /b 0
                            docker rm %CONTAINER_NAME% || exit /b 0
                        ) else (
                            echo No se encontró contenedor previo, continuando...
                        )
                    '''
                }
            }
        }

        stage('Ejecutar contenedor') {
            steps {
                script {
                    echo "🚀 Iniciando nueva versión de la aplicación..."
                    bat "docker run -d -p 3000:3000 --name %CONTAINER_NAME% %IMAGE_NAME%"
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
