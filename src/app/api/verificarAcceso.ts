// src/app/pages/api/verificarAcceso.ts
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/src/services/firebaseConfig";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";

// Función auxiliar para normalizar el nombre del área
const normalizarTexto = (texto: string) => texto.toLowerCase().replace(/\s+/g, "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { huellaID, area } = req.body; 

  if (!huellaID || !area) {
    return res.status(400).json({ error: "Faltan datos (huellaID o área)" });
  }

  // 1. Preprocesar datos
  const huellaNum = parseInt(String(huellaID)); 
  const areaNorm = normalizarTexto(String(area));

  try {
    // 2. IDENTIFICACIÓN: Buscar usuario por ID de huella en '1_USUARIOS'
    const usersSnap = await getDocs(collection(db, "1_USUARIOS"));

    for (const userDoc of usersSnap.docs) {
      const data = userDoc.data();
      const userID = userDoc.id;

      if (data.huella1 === huellaNum || data.huella2 === huellaNum) {
        
        // 3. AUTORIZACIÓN: Revisar si el usuario tiene acceso a esta área
        const permisoID = `${userID}_${areaNorm}`;
        
        // Buscar en la colección '3_PERMISOS'
        const permisoDoc = await getDoc(doc(db, "3_PERMISOS", permisoID));

        const tieneAcceso = permisoDoc.exists() && permisoDoc.data().habilitado === true;

        return res.status(200).json({
          acceso: tieneAcceso, 
          nombre: data.nombre || "Sin nombre",
          matricula: data.matricula || "",
          huellaID: huellaNum,
          userID: userID
        });
      }
    }

    // Huella no registrada
    return res.status(200).json({ acceso: false, mensaje: "Huella no registrada" });

  } catch (error) {
    console.error("Error verificando acceso:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}