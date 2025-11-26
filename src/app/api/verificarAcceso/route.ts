// src/app/api/verificarAcceso/route.ts
import { db } from "@/src/services/firebaseConfig";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore"; // Importamos addDoc
import { NextRequest, NextResponse } from "next/server";

const normalizar = (s: string) => s.toLowerCase().replace(/\s+/g, "");

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { huellaID, area } = body;

    if (!huellaID || !area) {
        return NextResponse.json({ acceso: false, error: "Faltan datos" }, { status: 400 });
    }

    const huellaNum = parseInt(String(huellaID));
    const areaNorm = normalizar(String(area));

    let userID = null;
    let userName = "Usuario Desconocido";
    let userMatricula = "";
    let tieneAcceso = false;

    try {
        // 1. IDENTIFICACIÓN: Buscar usuario por ID de huella en '1_USUARIOS'
        const usersSnap = await getDocs(collection(db, "1_USUARIOS"));

        for (const userDoc of usersSnap.docs) {
              const data = userDoc.data();
              
              if (data.huella1 === huellaNum || data.huella2 === huellaNum) {
                    userID = userDoc.id;
                    userName = data.nombre;
                    userMatricula = data.matricula || "";
                    
                    // 2. AUTORIZACIÓN: Buscar permiso en 3_PERMISOS
                    const permisoId = `${userID}_${areaNorm}`;
                    const permisoDoc = await getDoc(doc(db, "3_PERMISOS", permisoId));

                    tieneAcceso = permisoDoc.exists() && permisoDoc.data().habilitado === true;
                    
                    // Una vez encontrado el usuario y verificado el permiso, salimos del bucle
                    break; 
              }
        }

        // 🛑 3. REGISTRAR EVENTO EN LA BITÁCORA (4_LOGS)
        // Se ejecuta sin importar si el acceso fue concedido o denegado
        await addDoc(collection(db, "4_LOGS"), {
            timestamp: new Date().toISOString(),
            userID: userID || 'N/A', // Usar N/A si la huella no está registrada
            nombre: userName,
            matricula: userMatricula,
            area: areaNorm,
            huellaID: huellaNum,
            acceso: tieneAcceso
        });

        // 4. RESPUESTA AL ESP32
        return NextResponse.json({
              acceso: tieneAcceso,
              nombre: userName,
              matricula: userMatricula,
          });

    } catch (error) {
        console.error("Error verificando acceso o escribiendo log:", error);
        // En caso de error, denegamos el acceso por seguridad
        return NextResponse.json({ acceso: false, error: "Error de servidor" }, { status: 500 });
    }
}