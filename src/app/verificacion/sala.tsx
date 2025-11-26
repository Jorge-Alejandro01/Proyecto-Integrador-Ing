"use client";

import React, { useState } from "react";

const NOMBRE_AREA = "Sala de reuniones 1"; // Cambia esto según el área

const VerificarHuellaPage: React.FC = () => {
  const [mensaje, setMensaje] = useState("");
  const [verificando, setVerificando] = useState(false);

  const verificarHuella = async () => {
    setVerificando(true);
    setMensaje("🔍 Escaneando huella...");

    try {
      // 1. Esperamos que el usuario ponga el dedo y ESP lea la huella
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const response = await fetch("http://192.168.137.246/verificarHuella");
      const texto = await response.text();

      if (!response.ok) {
        setMensaje("❌ Error al comunicarse con el ESP");
        return;
      }

      const idMatch = texto.match(/ID: (\d+)/);
      if (!idMatch) {
        setMensaje("❌ No se pudo leer huella: " + texto.trim());
        return;
      }

      const huellaID = parseInt(idMatch[1]);
      setMensaje("🧠 Consultando permisos para ID " + huellaID + "...");

      // 2. Consultar a tu backend Next.js
      const accesoRes = await fetch("/api/verificarAcceso", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ huellaID, area: NOMBRE_AREA }),
      });

      const datos = await accesoRes.json();

      if (datos.acceso) {
        setMensaje(`✅ Acceso permitido: ${datos.nombre} (${datos.matricula})`);
      } else {
        setMensaje("⛔ Acceso denegado");
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje("❌ Error general");
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
