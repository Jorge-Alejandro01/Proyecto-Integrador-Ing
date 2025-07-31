// src/app/pages/api/verificarAcceso.ts

import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/src/services/firebaseConfig";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { huellaID, area } = req.body;

  if (!huellaID || !area) {
    return res.status(400).json({ error: "Faltan datos (huellaID o área)" });
  }

  try {
    const usersSnap = await getDocs(collection(db, "users"));

    for (const userDoc of usersSnap.docs) {
      const data = userDoc.data();
      const userID = userDoc.id;

      if (data.huella1 == huellaID || data.huella2 == huellaID) {
        // Revisar si el usuario tiene acceso a esta área
        const permisoID = `${userID}_${area}`;
        const permisoDoc = await getDoc(doc(db, "permisos", permisoID));

        const tieneAcceso = permisoDoc.exists() && permisoDoc.data().habilitado === true;

        return res.status(200).json({
          acceso: tieneAcceso,
          nombre: data.nombre || "Sin nombre",
          matricula: data.matricula || "",
        });
      }
    }

    return res.status(200).json({ acceso: false, mensaje: "Huella no registrada" });

  } catch (error) {
    console.error("Error verificando acceso:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
