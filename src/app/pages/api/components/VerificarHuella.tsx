import { NextApiRequest, NextApiResponse } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/src/services/firebaseConfig";

//metodo para verificar si una huella esta registrada
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { huellaID } = req.body;

  try {
    const usersSnap = await getDocs(collection(db, "users"));

    for (const user of usersSnap.docs) {
      const data = user.data();
      if (data.huella1 === huellaID || data.huella2 === huellaID) {
        return res.status(200).json({
          registrado: true,
          nombre: data.nombre || "Sin nombre",
          matricula: data.matricula || "",
        });
      }
    }

    return res.status(200).json({ registrado: false });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
}
