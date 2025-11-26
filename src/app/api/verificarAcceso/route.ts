// src/app/api/verificarAcceso/route.ts
import { db } from "@/src/services/firebaseConfig";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

const normalizar = (s: string) => s.toLowerCase().replace(/\s+/g, "");

export async function POST(req: NextRequest) {
    // Usamos req.json() para el App Router
    const body = await req.json();
    const { huellaID, area } = body;

    if (!huellaID || !area) {
        return NextResponse.json({ acceso: false, error: "Faltan datos" }, { status: 400 });
    }

    const huellaNum = parseInt(String(huellaID));
    const areaNorm = normalizar(String(area));

    try {
        // COLECCIÓN DE USUARIOS: 1_USUARIOS
        const usersSnap = await getDocs(collection(db, "1_USUARIOS"));

        for (const userDoc of usersSnap.docs) {
              const data = userDoc.data();
              const userID = userDoc.id;

              // 1. IDENTIFICACIÓN: Huella coincide
              if (data.huella1 === huellaNum || data.huella2 === huellaNum) {

                    // 2. AUTORIZACIÓN: Buscar permiso en 3_PERMISOS
                    const permisoId = `${userID}_${areaNorm}`;
                    const permisoDoc = await getDoc(doc(db, "3_PERMISOS", permisoId));

                    const tieneAcceso = permisoDoc.exists() && permisoDoc.data().habilitado === true;

                    // 3. RESPUESTA JSON FINAL (lo que el ESP espera)
                    return NextResponse.json({
                          acceso: tieneAcceso, // true o false
                          nombre: data.nombre,
                          matricula: data.matricula,
                    });
              }
        }

        // Huella no registrada en 1_USUARIOS
        return NextResponse.json({ acceso: false, mensaje: "Huella no registrada" });

    } catch (error) {
        console.error("Error verificando acceso:", error);
        return NextResponse.json({ acceso: false, error: "Error de servidor" }, { status: 500 });
    }
}