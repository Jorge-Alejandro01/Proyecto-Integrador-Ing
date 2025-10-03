pipeline {
    agent any
    
    environment {
        BLUE_PORT = '8081'
        GREEN_PORT = '8082'
        
        APP_INTERNAL_PORT = '8080' 
        
        DOCKER_IMAGE_NAME = 'cerraduras-int'
        
        TARGET_HOST = 'localhost'
        
        SSH_CREDENTIALS_ID = 'jenkins-ssh-target' 

        CURRENT_LIVE_ENV = '' 
        TARGET_ENV_NAME = ''
        TARGET_ENV_PORT = ''
    }
    
    stages {
        stage('0. Determinar Entornos (Azul/Verde)') {
            steps {
                script {
                    
                    def isBlueActive = sh(returnStatus: true, script: "docker ps -q -f name=blue_app") == 0

                    if (isBlueActive) {
                        CURRENT_LIVE_ENV = 'blue'
                        TARGET_ENV_NAME = 'green'
                        TARGET_ENV_PORT = GREEN_PORT
                        echo "Blue está activo. El despliegue se dirigirá al entorno ${TARGET_ENV_NAME} en el puerto ${TARGET_ENV_PORT}"
                    } else {
                        CURRENT_LIVE_ENV = 'green'
                        TARGET_ENV_NAME = 'blue'
                        TARGET_ENV_PORT = BLUE_PORT
                        echo "Verde está activo o es el primer despliegue. El despliegue se dirigirá al entorno ${TARGET_ENV_NAME} en el puerto ${TARGET_ENV_PORT}"
                    }
                }
            }
        }

        stage('1. Clonar Repositorio') {
            steps {
                checkout scm
            }
        }

        stage('2. Construir Imagen Docker') {
            steps {
                script {
                    def tagName = "${DOCKER_IMAGE_NAME}:${BUILD_ID}"
                    sh "docker build -t ${tagName} ."
                    env.DOCKER_TAG = tagName
                }
            }
        }

        stage('3. Despliegue en Entorno Inactivo') {
            steps {
                // Como el TARGET_HOST es 'localhost', no necesitamos el bloque sshagent/ssh,
                // ¡pero lo mantenemos para que el pipeline funcione en un servidor remoto después!
                // En 'localhost', Jenkins ejecuta estos comandos directamente.
                sh """
                    echo "Deteniendo y eliminando el contenedor antiguo ${TARGET_ENV_NAME}_app..."
                    docker stop ${TARGET_ENV_NAME}_app || true
                    docker rm ${TARGET_ENV_NAME}_app || true
                    
                    echo "Desplegando la nueva versión (${env.DOCKER_TAG}) en el puerto ${TARGET_ENV_PORT}..."
                    docker run -d \\
                       -p ${TARGET_ENV_PORT}:${APP_INTERNAL_PORT} \\
                       --name ${TARGET_ENV_NAME}_app \\
                       ${env.DOCKER_TAG}
                    
                    echo "Esperando 10 segundos para que la aplicación inicie..."
                    sleep 10
                """
            }
        }

        stage('4. Pruebas de Humo (Sanity Check)') {
            steps {
                script {
                    // Usamos la URL base. Recuerda que es mejor usar un /api/health
                    def testUrl = "http://${TARGET_HOST}:${TARGET_ENV_PORT}/" 
                    
                    // Curl intenta 5 veces con 5 segundos de retraso si falla (por si la app tarda en iniciar)
                    sh "curl --fail --retry 5 --retry-delay 5 ${testUrl}"
                    
                    echo "Pruebas de Humo superadas. El nuevo entorno (${TARGET_ENV_NAME}) está listo."
                }
            }
        }

        stage('5. Conmutación de Tráfico (Swap)') {
            steps {
                input(message: "El entorno ${TARGET_ENV_NAME} ha pasado las pruebas. ¿Confirmas la conmutación de tráfico?", ok: "¡Desplegar!")
                
                // Si el TARGET_HOST es localhost, esto se puede ejecutar directamente
                // Pero como usamos SSH_CREDENTIALS_ID, lo dejamos así para compatibilidad con el futuro
                sshagent(credentials: [SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no jenkins@${TARGET_HOST} '
                        echo "Ejecutando script de conmutación de tráfico..."
                        # ¡IMPORTANTE! Asegúrate de que este script exista en el servidor y tenga permisos de sudo SIN contraseña
                        sudo /usr/local/bin/proxy_swap.sh ${TARGET_ENV_PORT}
                        '
                    """
                }
            }
        }
        
        stage('6. Verificación Post-Swap y Limpieza') {
            steps {
                sh "sleep 5" 
                
                // Prueba final contra la URL de Producción (asumiendo que Nginx en el Host atiende en el puerto 80)
                sh "curl --fail http://${TARGET_HOST}/"
                echo "¡Despliegue Azul/Verde exitoso! El entorno ${TARGET_ENV_NAME} ahora está en vivo."

                // Limpieza
                sshagent(credentials: [SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no jenkins@${TARGET_HOST} '
                        echo "Deteniendo y eliminando el contenedor antiguo (${CURRENT_LIVE_ENV}_app)..."
                        docker stop ${CURRENT_LIVE_ENV}_app || true
                        docker rm ${CURRENT_LIVE_ENV}_app || true
                        '
                    """
                }
            }
        }
    }
}