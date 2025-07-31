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
  onSave: (user: Omit<User, "id">) => void;
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.matricula) {
      alert("Por favor, complete todos los campos requeridos");
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {user ? "Editar Usuario" : "Nuevo Usuario"}
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label htmlFor="nombre" className={styles.inputLabel}>
                Nombre Completo *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                placeholder="Ej: Juan Pérez"
                value={formData.nombre}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="matricula" className={styles.inputLabel}>
                Matrícula *
              </label>
              <input
                type="text"
                id="matricula"
                name="matricula"
                placeholder="Ej: 123456"
                value={formData.matricula}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.button}>
              {user ? "Actualizar Usuario" : "Guardar Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewUserModal;
