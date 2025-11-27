"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link"; // Necesario para la navegación
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/src/services/firebaseConfig";
import { Table, Tag, Typography, Card, Space, theme, Button } from "antd";
import { AuditOutlined, UserOutlined, TeamOutlined, ReloadOutlined } from "@ant-design/icons"; // Importamos iconos necesarios

const { Title, Text } = Typography;
const { useToken } = theme;

interface LogEntry {
  id: string;
  timestamp: string;
  nombre: string;
  matricula: string;
  area: string;
  huellaID: number;
  acceso: boolean;
}

// Función auxiliar para formatear la fecha
const formatTimestamp = (isoString: string) => {
  if (!isoString) return "Fecha no registrada";
  try {
    const date = new Date(isoString);
    // Formato legible: Ej. 26/11/2025, 12:09:34 a. m.
    return date.toLocaleString(); 
  } catch {
    return "Fecha inválida";
  }
};

const BitacoraPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useToken(); 

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      // Consultamos la colección 4_LOGS, ordenando por timestamp descendente
      const logsQuery = query(
        collection(db, "4_LOGS"),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(logsQuery);
      
      const logsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          timestamp: data.timestamp || "", 
          nombre: data.nombre || "Usuario Desconocido",
          matricula: data.matricula || "N/A",
          area: data.area || "N/A",
          huellaID: data.huellaID as number || 0,
          acceso: data.acceso === true, 
        };
      });

      setLogs(logsData);
    } catch (error) {
      console.error("Error al obtener la bitácora:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // ----------------------------------------------------------------
  // Definición de las Columnas de la Tabla Ant Design
  // ----------------------------------------------------------------
  const columns = [
    {
      title: "Resultado",
      dataIndex: "acceso",
      key: "acceso",
      render: (acceso: boolean) => (
        <Tag 
          color={acceso ? "green" : "red"} 
          style={{ fontWeight: 'bold', minWidth: 120, textAlign: 'center' }}
        >
          {acceso ? "CONCEDIDO" : "DENEGADO"}
        </Tag>
      ),
      width: 150,
      fixed: 'left' as const, 
    },
    {
      title: "Fecha y Hora",
      dataIndex: "timestamp",
      key: "timestamp",
      render: formatTimestamp,
      width: 200,
      responsive: ['md'] as const,
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      width: 180,
    },
    {
      title: "Matrícula",
      dataIndex: "matricula",
      key: "matricula",
      width: 120,
    },
    {
      title: "Área",
      dataIndex: "area",
      key: "area",
      render: (area: string) => <Text strong>{area.toUpperCase()}</Text>,
      width: 120,
    },
    {
      title: "Huella ID",
      dataIndex: "huellaID",
      key: "huellaID",
      width: 100,
      render: (id: number) => id === 0 ? "N/A" : id,
      responsive: ['lg'] as const,
    },
  ];

  return (
    <div style={{ 
        padding: '20px', 
        backgroundColor: token.colorBgLayout, 
        minHeight: "100vh" 
    }}>
      <div style={{ 
          maxWidth: 1200, 
          margin: "0 auto",
          padding: '0 10px' 
      }}>
        {/* 🛑 ENCABEZADO Y BOTONES DE NAVEGACIÓN (NUEVO) 🛑 */}
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: token.margin, 
            marginBottom: token.marginLG 
        }}>
            {/* Título de la Bitácora */}
            <div>
                <Title level={2} style={{ margin: 0, color: token.colorPrimary }}>
                    <AuditOutlined /> Bitácora de Acceso
                </Title>
                <Text type="secondary">
                    Registro histórico de todos los intentos de acceso y sus resultados.
                </Text>
            </div>

            {/* Grupo de Botones de Navegación y Actualización */}
            <Space wrap size="middle" style={{ marginTop: token.marginSM }}>
                
                {/* Botón Ir a Usuarios */}
                <Link href="/registro-usuarios" passHref>
                    <Button 
                        icon={<UserOutlined />} 
                        type="default" 
                        style={{ borderRadius: token.borderRadiusLG }}
                    >
                        Ir a Usuarios
                    </Button>
                </Link>
                
                {/* Botón Ir a Áreas */}
                <Link href="/areas" passHref>
                    <Button 
                        icon={<TeamOutlined />} 
                        type="default" 
                        style={{ borderRadius: token.borderRadiusLG }}
                    >
                        Gestionar Áreas
                    </Button>
                </Link>

                {/* Botón Actualizar Registros */}
                <Button 
                    icon={<ReloadOutlined />} 
                    onClick={fetchLogs} 
                    type="primary"
                    style={{ borderRadius: token.borderRadiusLG }}
                    loading={loading}
                >
                    Actualizar
                </Button>
            </Space>
        </div>
        {/* 🛑 FIN DEL ENCABEZADO DE NAVEGACIÓN 🛑 */}


        <Card 
          style={{ 
            borderRadius: token.borderRadiusLG, 
            boxShadow: token.boxShadowSecondary 
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            dataSource={logs}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ 
                pageSize: 15,
                showSizeChanger: false,
                position: ['bottomCenter']
            }}
            scroll={{ x: 800 }} 
            locale={{ emptyText: 'No hay registros de acceso aún.' }}
            style={{ border: 'none' }}
          />
        </Card>
      </div>
    </div>
  );
};

export default BitacoraPage;
