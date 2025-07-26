"use client";

import React, { useState } from "react";

const VerificarHuellaPage: React.FC = () => {
  const [mensaje, setMensaje] = useState("");
  const [verificando, setVerificando] = useState(false);

  const verificarHuella = async () => {
    setVerificando(true);
    setMensaje("🔍 Escaneando huella...");

    try {
      //ip del esp
      const response = await fetch("http://192.168.1.60/verificarHuella");
      const texto = await response.text();

      if (!response.ok) {
        setMensaje("❌ Error al comunicarse con el ESP");
        console.error("Error:", texto);
      } else {
        setMensaje(texto.trim());
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
