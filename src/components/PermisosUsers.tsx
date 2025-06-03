"use client";
import React, { useState, useEffect } from "react";
import styles from "@/src/interfaces/RegistroU.module.css";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/src/services/firebaseConfig";

interface User {
  id: string;
  nombre: string;
  matricula: string;
  huella1: string;
  huella2: string;
  accesos: string[];
}

const puertasDisponibles = [
  "Puerta Principal",
  "Laboratorio",
  "Oficina",
  "Sala de Juntas",
];

const PermisosUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(usersData);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleToggleAccess = async (userId: string, puerta: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const updatedAccesos = user.accesos.includes(puerta)
      ? user.accesos.filter((p) => p !== puerta)
      : [...user.accesos, puerta];

    await updateDoc(doc(db, "users", userId), { accesos: updatedAccesos });

    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === userId ? { ...u, accesos: updatedAccesos } : u
      )
    );
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Gestión de Permisos</h2>
      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Matrícula</th>
              {puertasDisponibles.map((puerta) => (
                <th key={puerta}>{puerta}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.nombre}</td>
                <td>{user.matricula}</td>
                {puertasDisponibles.map((puerta) => (
                  <td key={puerta}>
                    <input
                      type="checkbox"
                      checked={user.accesos.includes(puerta)}
                      onChange={() => handleToggleAccess(user.id, puerta)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PermisosUsers;
