"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "@/src/interfaces/RegistroU.module.css";
import NewUserModal from "@/src/components/NewUserModal";
import BotonHuellas from "@/src/components/BotonHuellas";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/src/services/firebaseConfig";
import { Modal, Checkbox, message, Tag } from "antd";
import { QueryDocumentSnapshot } from "firebase-functions/firestore";

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
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [areas, setAreas] = useState<{ id: string; nombre: string }[]>([]);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>(
    []
  );
  const [modalPermisosVisible, setModalPermisosVisible] = useState(false);
  const [permisosPorUsuario, setPermisosPorUsuario] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = querySnapshot.docs
          .map((doc: QueryDocumentSnapshot) => {
            ///error aqui
            const data = doc.data();
            return {
              id: doc.id,
              nombre: data.nombre ?? "",
              matricula: data.matricula ?? "",
              huella1: data.huella1 ?? "",
              huella2: data.huella2 ?? "",
            };
          })
          .filter((user: User) => user.nombre !== "" && user.matricula !== "");

        setUsers(usersData);

        const permisosSnap = await getDocs(collection(db, "permisos"));
        const permisos = permisosSnap.docs.map((doc: QueryDocumentSnapshot) =>
          doc.data()
        );
        interface Permiso {
          userID: string;
          areaID: string;
          habilitado: boolean;
        }
        const agrupados: Record<string, string[]> = {};
        permisos.forEach((perm: Permiso) => {
          if (perm.habilitado) {
            if (!agrupados[perm.userID]) agrupados[perm.userID] = [];
            agrupados[perm.userID].push(perm.areaID);
          }
        });
        setPermisosPorUsuario(agrupados);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (newUser: Omit<User, "id">) => {
    try {
      if (editingUser) {
        await updateDoc(doc(db, "users", editingUser.id), newUser);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === editingUser.id
              ? { ...newUser, id: editingUser.id }
              : user
          )
        );
      } else {
        const docRef = await addDoc(collection(db, "users"), newUser);
        setUsers((prevUsers) => [...prevUsers, { ...newUser, id: docRef.id }]);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      alert("Ocurrió un error al guardar el usuario.");
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await deleteDoc(doc(db, "users", id));
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        alert("Ocurrió un error al eliminar el usuario.");
      }
    }
  };

  const abrirPermisos = async (user: User) => {
    setSelectedUser(user);
    setModalPermisosVisible(true);

    const areasSnap = await getDocs(collection(db, "areas"));
    const todasLasAreas = areasSnap.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      nombre: doc.data().nombre,
    }));
    setAreas(todasLasAreas);

    interface Permiso {
      userID: string;
      areaID: string;
      habilitado: boolean;
    }

    const permisosSnap = await getDocs(collection(db, "permisos"));
    const permisosDelUsuario = permisosSnap.docs
      .map((doc: QueryDocumentSnapshot) => doc.data() as Permiso)
      .filter((perm: Permiso) => perm.userID === user.id && perm.habilitado)
      .map((perm: Permiso) => perm.areaID);

    setPermisosSeleccionados(permisosDelUsuario);
  };

  const guardarPermisos = async () => {
    try {
      if (!selectedUser) return;

      for (const area of areas) {
        const habilitado = permisosSeleccionados.includes(area.id);
        await setDoc(doc(db, "permisos", `${selectedUser.id}_${area.id}`), {
          userID: selectedUser.id,
          areaID: area.id,
          habilitado,
        });
      }

      setPermisosPorUsuario((prev) => ({
        ...prev,
        [selectedUser.id]: [...permisosSeleccionados],
      }));

      message.success("Permisos actualizados correctamente");
      setModalPermisosVisible(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error al guardar permisos:", error);
      message.error("Ocurrió un error al guardar los permisos");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Registro de Usuarios</h2>
      <div className={styles.actions}>
        <Link href="/areas">
          <button
            style={{
              backgroundColor: "#3498db",
              color: "white",
              borderRadius: "9999px",
              padding: "8px 16px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              marginRight: "10px",
            }}
          >
            Ir a Áreas
          </button>
        </Link>
        <div className={styles.header}></div>
        <button onClick={handleOpenModal} className={styles.newButton}>
          <i className="fas fa-plus"></i> Nuevo Usuario
        </button>
      </div>

      <NewUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        user={editingUser}
      />

      {loading ? (
        <div className={styles.loading}>Cargando usuarios...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "20%" }}>Nombre</th>
                <th style={{ width: "15%" }}>Matrícula</th>
                <th style={{ width: "15%" }}>Huella 1</th>
                <th style={{ width: "15%" }}>Huella 2</th>
                <th style={{ width: "15%" }}>Permisos</th>
                <th style={{ width: "20%" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.nombre || "-"}</td>
                    <td>{user.matricula || "-"}</td>
                    <td>
                      {user.huella1 ? (
                        "✅ Registrada"
                      ) : (
                        <BotonHuellas userID={user.id} huellaCampo="huella1" />
                      )}
                    </td>
                    <td>
                      {user.huella2 ? (
                        "✅ Registrada"
                      ) : (
                        <BotonHuellas userID={user.id} huellaCampo="huella2" />
                      )}
                    </td>
                    <td>
                      {permisosPorUsuario[user.id]?.length ? (
                        <Tag color="blue">
                          {permisosPorUsuario[user.id].length} asignado(s)
                        </Tag>
                      ) : (
                        <Tag color="red">Sin acceso</Tag>
                      )}
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => handleEditUser(user)}
                          className={`${styles.actionButton} ${styles.editButton}`}
                        >
                          <i className="fas fa-edit"></i> Editar
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                        >
                          <i className="fas fa-trash-alt"></i> Eliminar
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.permisosButton}`}
                          onClick={() => abrirPermisos(user)}
                        >
                          <i className="fas fa-user-shield"></i> Permisos
                        </button>
                      </div>
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
      )}

      <Modal
        title={`Permisos de acceso: ${selectedUser?.nombre}`}
        open={modalPermisosVisible}
        onCancel={() => setModalPermisosVisible(false)}
        onOk={guardarPermisos}
        okText="Guardar"
        cancelText="Cancelar"
      >
        {areas.length === 0 ? (
          <p>No hay áreas registradas.</p>
        ) : (
          <Checkbox.Group
            value={permisosSeleccionados}
            onChange={(val) => setPermisosSeleccionados(val as string[])}
          >
            {areas.map((area) => (
              <div key={area.id} style={{ marginBottom: 8 }}>
                <Checkbox value={area.id}>{area.nombre}</Checkbox>
              </div>
            ))}
          </Checkbox.Group>
        )}
      </Modal>
    </div>
  );
};

export default RegistroUsers;
