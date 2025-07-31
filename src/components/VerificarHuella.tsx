import { NextApiRequest, NextApiResponse } from "next";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/src/services/firebaseConfig";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { huella } = req.body;
  if (!huella) return res.status(400).json({ error: "Falta la huella" });

  try {
    const usersSnap = await getDocs(collection(db, "users"));

    for (const user of usersSnap.docs) {
      const userDocSnap = await getDoc(doc(db, "users", user.id));

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        if (data.huella1 === huella || data.huella2 === huella) {
          return res.status(200).json({
            registrado: true,
            nombre: data.nombre || "Sin nombre",
            matricula: data.matricula || "",
          });
        }
      }
    }

    return res.status(200).json({ registrado: false });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
}
