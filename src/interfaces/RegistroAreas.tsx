"use client";

import React, { useState, useEffect } from "react";
import styles from "@/src/interfaces/RegistroU.module.css";
import AreaModal from "@/src/components/AreaModal"; 
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/src/services/firebaseConfig";
import { message } from "antd";

interface Area {
  id: string;
  nombre: string;
}

// Función auxiliar para normalizar nombres de área (usada en la colección de permisos 3_PERMISOS)
function normalizarTexto(texto: string) {
  return texto.toLowerCase().replace(/\s+/g, "");
}

const RegistroAreas: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAreas = async () => {
    setLoading(true);
    try {
      // LECTURA: Usando la nueva colección '2_AREAS'
      const querySnapshot = await getDocs(collection(db, "2_AREAS"));
      const areasData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        nombre: doc.data().nombre ?? "",
      }));
      setAreas(areasData);
    } catch (error) {
      console.error("Error al obtener áreas:", error);
      message.error("Error al cargar las áreas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingArea(null);
  };

  const handleSaveArea = async (newArea: Omit<Area, "id">) => {
    try {
      if (editingArea) {
        // EDICIÓN: Actualizar en '2_AREAS'
        await updateDoc(doc(db, "2_AREAS", editingArea.id), newArea);
        setAreas((prevAreas) =>
          prevAreas.map((area) =>
            area.id === editingArea.id ? { ...newArea, id: editingArea.id } : area
          )
        );
        message.success(`Área "${newArea.nombre}" actualizada.`);
      } else {
        // CREACIÓN: Añadir a '2_AREAS'
        const docRef = await addDoc(collection(db, "2_AREAS"), newArea);
        setAreas((prevAreas) => [...prevAreas, { ...newArea, id: docRef.id }]);
        message.success(`Área "${newArea.nombre}" creada.`);
      }
      handleCloseModal();
      // Refrescar para asegurar que los datos en la tabla estén actualizados
      fetchAreas(); 
    } catch (error) {
      console.error("Error al guardar área:", error);
      message.error("Ocurrió un error al guardar el área.");
    }
  };

  const handleEditArea = (area: Area) => {
    setEditingArea(area);
    setIsModalOpen(true);
  };

  const handleDeleteArea = async (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el área "${nombre}"?`)) {
      try {
        // ELIMINACIÓN: Borrar de '2_AREAS'
        await deleteDoc(doc(db, "2_AREAS", id));
        setAreas((prevAreas) => prevAreas.filter((area) => area.id !== id));
        message.success(`Área "${nombre}" eliminada correctamente.`);
        
        // NOTA IMPORTANTE: Para una aplicación robusta, es recomendable
        // eliminar también todos los documentos de la colección '3_PERMISOS'
        // que referencien esta área.
      } catch (error) {
        console.error("Error al eliminar área:", error);
        message.error("Ocurrió un error al eliminar el área.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Registro y Gestión de Áreas</h2>
      
      <div className={styles.actions}>
          <button onClick={handleOpenModal} className={styles.newButton}>
            <i className="fas fa-plus"></i> Nueva Área
          </button>
      </div>

      <AreaModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveArea}
        area={editingArea}
      />

      {loading ? (
        <div className={styles.loading}>Cargando áreas...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Nombre del Área</th>
                <th style={{ width: "20%" }}>ID de Permiso</th>
                <th style={{ width: "50%" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {areas.length > 0 ? (
                areas.map((area) => (
                  <tr key={area.id}>
                    <td>{area.nombre || "-"}</td>
                    {/* Mostrar el ID Normalizado, que es el que se usa en 3_PERMISOS */}
                    <td>{normalizarTexto(area.nombre)}</td> 
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => handleEditArea(area)}
                          className={`${styles.actionButton} ${styles.editButton}`}
                        >
                          <i className="fas fa-edit"></i> Editar
                        </button>
                        <button
                          onClick={() => handleDeleteArea(area.id, area.nombre)}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                        >
                          <i className="fas fa-trash-alt"></i> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className={styles.noDatos}>
                    No hay áreas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RegistroAreas;