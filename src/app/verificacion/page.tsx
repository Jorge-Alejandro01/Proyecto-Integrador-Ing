"use client";

import React, { useState } from "react";

const VerificarHuellaPage: React.FC = () => {
  const [mensaje, setMensaje] = useState("");
  const [verificando, setVerificando] = useState(false);

  const verificarHuella = async () => {
    setVerificando(true);
    setMensaje("🔍 Escaneando huella...");

    try {
      // Cambia esta IP por la de tu ESP
      const response = await fetch("http://192.168.1.8/verificarHuella");
      const result = await response.json();

      if (result.registrado) {
        setMensaje(`✅ Usuario registrado: ${result.nombre}`);
      } else {
        setMensaje("❌ Este usuario no está registrado.");
      }
    } catch (error) {
      console.error("Error al verificar huella:", error);
      setMensaje("❌ No se pudo conectar al verificador.");
    }

    setVerificando(false);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Verificación de Huella</h1>
      <p>Presiona el botón y coloca el dedo en el sensor.</p>

      <button
        onClick={verificarHuella}
        disabled={verificando}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: verificando ? "#ccc" : "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
        }}
      >
        {verificando ? "Verificando..." : "Verificar Huella"}
      </button>

      <div style={{ marginTop: "30px", fontSize: "18px", fontWeight: "bold" }}>
        {mensaje}
      </div>
    </div>
  );
};

export default VerificarHuellaPage;
