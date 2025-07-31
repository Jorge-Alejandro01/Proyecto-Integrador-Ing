// src/app/api/verificarAcceso/route.ts

import { db } from "@/src/services/firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { huellaID, area } = body;

  if (!huellaID || !area) {
    return NextResponse.json({ error: "Faltan datos (huellaID o área)" }, { status: 400 });
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

        return NextResponse.json({
          acceso: tieneAcceso,
          nombre: data.nombre || "Sin nombre",
          matricula: data.matricula || "",
        });
      }
    }

    return NextResponse.json({ acceso: false, mensaje: "Huella no registrada" });

  } catch (error) {
    console.error("Error verificando acceso:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
