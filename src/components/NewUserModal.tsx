"use client";
import React, { useState, useEffect } from "react";
import styles from "@/src/interfaces/RegistroU.module.css";

interface User {
  id: string;
  nombre: string;
  matricula: string;
  huella1: string;
  huella2: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  user?: User | null;
}

const NewUserModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
}) => {
  const [formData, setFormData] = useState<Omit<User, "id">>({
    nombre: "",
    matricula: "",
    huella1: "",
    huella2: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre,
        matricula: user.matricula,
        huella1: user.huella1,
        huella2: user.huella2,
      });
    } else {
      setFormData({
        nombre: "",
        matricula: "",
        huella1: "",
        huella2: "",
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSave = () => {
    if (!formData.nombre || !formData.matricula) {
      alert("Por favor, llena todos los campos");
      return;
    }

    const newUser = user
      ? { ...formData, id: user.id }
      : { ...formData, id: generateId() };

    onSave(newUser);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>{user ? "Editar Usuario" : "Registrar Nuevo Usuario"}</h2>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          className={styles.input}
        />
        <input
          type="text"
          name="matricula"
          placeholder="Matrícula"
          value={formData.matricula}
          onChange={handleChange}
          className={styles.input}
        />

        <button onClick={handleSave} className={styles.button}>
          Guardar
        </button>
        <button onClick={onClose} className={styles.cancelButton}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default NewUserModal;
