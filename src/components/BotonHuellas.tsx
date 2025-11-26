// ASUMIENDO QUE ESTE ES TU ARCHIVO BotonHuellas.tsx
"use client";
import React, { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/src/services/firebaseConfig'; // Asegúrate que la ruta sea correcta
import { Button, message } from 'antd'; // Usaremos 'antd' para la UI

interface BotonHuellasProps {
    userID: string;
    huellaCampo: "huella1" | "huella2";
    onSuccess: () => void; // 🛑 NUEVO: Propiedad para notificar al padre
}

// ⚠️ REEMPLAZAR con la IP de tu ESP32 (Módulo de Registro)
const ESP_API_BASE_URL = "http://192.168.137.245"; 

const BotonHuellas: React.FC<BotonHuellasProps> = ({ userID, huellaCampo, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState("Registrar Huella");

    const registrarHuella = async () => {
        setLoading(true);
        setMensaje("Esperando huella...");

        try {
            // 1. Llamar al ESP32 para iniciar el registro
            const url = `${ESP_API_BASE_URL}/registrarHuella`;
            const response = await fetch(url);
            
            if (!response.ok) {
                // Si el ESP32 no responde, significa que hubo un error de red o en el servidor
                throw new Error(`Error en el ESP32: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === "success" && result.huellaID) {
                const huellaID = parseInt(result.huellaID);
                
                // 2. Guardar el ID de la huella en Firebase
                const userRef = doc(db, "1_USUARIOS", userID);
                await updateDoc(userRef, {
                    [huellaCampo]: huellaID,
                });
                
                // 3. Notificar al componente padre que recargue la tabla
                onSuccess(); // 🛑 LLAMADA CLAVE: Actualiza la tabla padre

                setMensaje(`Huella registrada (ID: ${huellaID})`);
                message.success(`Huella ${huellaID} guardada para ${userID}.`);

            } else {
                setMensaje("Error en el sensor.");
                message.error("Error al registrar la huella en el sensor.");
            }

        } catch (error) {
            console.error("Error al registrar huella:", error);
            setMensaje("Error de Conexión/Sensor");
            message.error("Error: ¿Está el ESP32 de registro encendido y en línea?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button 
            onClick={registrarHuella} 
            loading={loading}
            style={{ 
                backgroundColor: loading ? '#f39c12' : '#2ecc71', 
                color: 'white', 
                borderRadius: '5px' 
            }}
        >
            {mensaje}
        </Button>
    );
};

export default BotonHuellas;
