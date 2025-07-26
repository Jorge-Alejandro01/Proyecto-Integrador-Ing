"use client";
import React, { useState, useEffect } from "react";
import styles from "@/src/interfaces/RegistroU.module.css";
import NewUserModal from "@/src/components/NewUserModal";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/src/services/firebaseConfig";
import BotonHuellas from "@/src/components/BotonHuellas";

interface User {
  id: string;
  nombre: string;
  matricula: string;
  huella1: string;
  huella2: string;
}

const RegistroUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            nombre: data.nombre ?? "",
            matricula: data.matricula ?? "",
            huella1: data.huella1 ?? "",
            huella2: data.huella2 ?? "",
          };
        })
        .filter((user) => user.nombre !== "" && user.matricula !== "");

      setUsers(usersData);
    };

    fetchUsers();
  }, []);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (newUser: Omit<User, "id">) => {
    if (editingUser) {
      await updateDoc(doc(db, "users", editingUser.id), newUser);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser.id ? { ...newUser, id: editingUser.id } : user
        )
      );
    } else {
      const docRef = await addDoc(collection(db, "users"), newUser);
      setUsers((prevUsers) => [...prevUsers, { ...newUser, id: docRef.id }]);
    }
    handleCloseModal();
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    await deleteDoc(doc(db, "users", id));
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Registro de Usuarios</h2>
      <button onClick={handleOpenModal} className={styles.newButton}>
        Nuevo
      </button>
      <NewUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        user={editingUser}
      />
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableTitulos}>
              <th>Nombre</th>
              <th>Matrícula</th>
              <th>Huella 1</th>
              <th>Huella 2</th>
              <th>Acciones</th>
              <th>Permisos</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.nombre}</td>
                  <td>{user.matricula}</td>
                  <td>
                    <BotonHuellas userID={user.id} huellaCampo="huella1" />
                  </td>
                  <td>
                    <BotonHuellas userID={user.id} huellaCampo="huella2" />
                  </td>
                  <td>
                    <button
                      onClick={() => handleEditUser(user)}
                      className={styles.editButton}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className={styles.deleteButton}
                    >
                      Eliminar
                    </button>
                  </td>
                  <td>
                    <button className={styles.permisosButton}>Permisos</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className={styles.noDatos}>
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistroUsers;
