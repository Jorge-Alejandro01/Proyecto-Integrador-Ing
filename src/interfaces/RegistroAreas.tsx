"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link"; 
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
import { message, Card, Button, Typography, Space, theme } from "antd"; // Importamos componentes de Ant Design
import { TeamOutlined, EditOutlined, DeleteOutlined, AuditOutlined, PlusOutlined, HomeOutlined } from "@ant-design/icons"; // Importamos iconos de Ant Design

const { Title, Text } = Typography;
const { useToken } = theme;

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
  
  const { token } = useToken(); // Usamos Ant Design theme token

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
        message.success(`Área "${newArea.nombre}" actualizada.`);
      } else {
        // CREACIÓN: Añadir a '2_AREAS'
        await addDoc(collection(db, "2_AREAS"), newArea);
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
        message.success(`Área "${nombre}" eliminada correctamente.`);
        fetchAreas();
      } catch (error) {
        console.error("Error al eliminar área:", error);
        message.error("Ocurrió un error al eliminar el área.");
      }
    }
  };

  return (
    <div style={{ 
        padding: '20px', 
        backgroundColor: token.colorBgLayout, 
        minHeight: "100vh" 
    }}>
      <div style={{ 
          maxWidth: 1000, 
          margin: "0 auto",
          padding: '0 10px' // Responsivo: Padding en móviles
      }}>
        {/* ENCABEZADO Y BOTONES DE ACCIÓN */}
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: token.margin, 
            marginBottom: token.marginLG 
        }}>
          {/* Título */}
          <div>
            <Title level={2} style={{ margin: 0, color: token.colorPrimary }}>
                <HomeOutlined /> Gestión de Áreas
            </Title>
            <Text type="secondary">
                Administra las ubicaciones y puntos de acceso del sistema.
            </Text>
          </div>

          {/* Grupo de Botones de Navegación y Creación */}
          <Space wrap size="middle" style={{ marginTop: token.marginSM }}>
            {/* 🛑 BOTÓN NUEVO: Ir a Bitácora */}
            <Link href="/bitacora" passHref>
                <Button 
                    icon={<AuditOutlined />} 
                    type="default" 
                    style={{ borderRadius: token.borderRadiusLG }}
                >
                    Ir a Bitácora
                </Button>
            </Link>
            
            <Link href="/registro-usuarios" passHref>
                <Button icon={<TeamOutlined />} type="default" style={{ borderRadius: token.borderRadiusLG }}>
                    Ir a Usuarios
                </Button>
            </Link>
            
            <Button 
                onClick={handleOpenModal} 
                type="primary" 
                style={{ borderRadius: token.borderRadiusLG }}
                icon={<PlusOutlined />}
            >
                Nueva Área
            </Button>
          </Space>
        </div>

        {/* MODAL DE ÁREAS */}
        {/* Asumo que AreaModal existe y es compatible con las props */}
        <AreaModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveArea}
          area={editingArea}
        />

        {/* CONTENEDOR DE LA TABLA */}
        <Card style={{ 
            borderRadius: token.borderRadiusLG, 
            boxShadow: token.boxShadowSecondary 
        }}>
          {loading ? (
            <div className={styles.loading}>Cargando áreas...</div>
          ) : (
            <div className={styles.tableContainer} style={{ minHeight: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: "35%" }}>Nombre del Área</th>
                    <th style={{ width: "35%" }} className={styles['hidden-sm']}>ID de Permiso (DB)</th>
                    <th style={{ width: "30%" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {areas.length > 0 ? (
                    areas.map((area) => (
                      <tr key={area.id}>
                        <td>{area.nombre || "-"}</td>
                        {/* Mostrar el ID Normalizado, que es el que se usa en 3_PERMISOS */}
                        <td className={styles['hidden-sm']}>
                            {normalizarTexto(area.nombre)}
                        </td> 
                        <td>
                          {/* 🛑 USO DE COMPONENTES BUTTON DE ANTD PARA ACCIONES */}
                          <Space size={5} direction="horizontal" wrap> 
                            <Button
                                onClick={() => handleEditArea(area)}
                                size="small"
                                icon={<EditOutlined />}
                                title="Editar Área"
                            >
                                Editar
                            </Button>
                            <Button
                                onClick={() => handleDeleteArea(area.id, area.nombre)}
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                title="Eliminar Área"
                            >
                                Eliminar
                            </Button>
                          </Space>
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
        </Card>
      </div>
    </div>
  );
};

export default RegistroAreas;