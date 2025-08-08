const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

exports.verificarAcceso = functions.https.onRequest(async (req, res) => {
  const idHuella = req.query.idHuella;
  const area = req.query.area;

  if (!idHuella || !area) {
    return res.status(400).json({ error: "Faltan parámetros" });
  }

  try {
    const docRef = db.collection("areas").doc(area);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ acceso: false, motivo: "Área no encontrada" });
    }

    const data = doc.data();
    const usuarios = data.usuarios || [];

    if (usuarios.includes(parseInt(idHuella))) {
      return res.json({ acceso: true });
    } else {
      return res.json({ acceso: false, motivo: "Sin permiso" });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno" });
  }
});
