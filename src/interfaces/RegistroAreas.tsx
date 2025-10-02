"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/src/services/firebaseConfig";
import { Area } from "./Area";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Typography,
  Card,
  Empty,
  Space,
  Tag,
  Checkbox,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
export default function RegistroAreas() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [usuarios, setUsuarios] = useState<{ id: string; nombre: string }[]>(
    []
  );
  const [permisos, setPermisos] = useState<Record<string, string[]>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Area | null>(null);
  const [form] = Form.useForm();
  const [modalUsuarios, setModalUsuarios] = useState(false);
  const [modalEdicion, setModalEdicion] = useState(false);
  const [areaSeleccionada, setAreaSeleccionada] = useState<Area | null>(null);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<string[]>(
    []
  );

  const cargarDatos = async () => {
    const [areasSnap, usersSnap, permisosSnap] = await Promise.all([
      getDocs(collection(db, "areas")),
      getDocs(collection(db, "users")),
      getDocs(collection(db, "permisos")),
    ]);

    const areasData = areasSnap.docs.map(
      (doc: FirebaseFirestore.DocumentData) => ({
        id: doc.id,
        ...doc.data(),
      })
    ) as Area[];
    setAreas(areasData);

    const usuariosData = usersSnap.docs.map(
      (doc: FirebaseFirestore.DocumentData) => ({
        id: doc.id,
        nombre: doc.data().nombre,
      })
    );
    setUsuarios(usuariosData);

    const permisosPorArea: Record<string, string[]> = {};
    permisosSnap.docs.forEach((doc: FirebaseFirestore.DocumentData) => {
      const data = doc.data();
      if (data.habilitado) {
        if (!permisosPorArea[data.areaID]) permisosPorArea[data.areaID] = [];
        permisosPorArea[data.areaID].push(data.userID);
      }
    });
    setPermisos(permisosPorArea);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirNuevo = () => {
    setEditando(null);
    form.resetFields();
    setModalOpen(true);
  };

  const guardarArea = async () => {
    try {
      const values = await form.validateFields();

      if (editando) {
        await updateDoc(doc(db, "areas", editando.id), values);
        setAreas((prev) =>
          prev.map((a) => (a.id === editando.id ? { ...a, ...values } : a))
        );
      } else {
        const nueva = await addDoc(collection(db, "areas"), values);
        setAreas((prev) => [...prev, { id: nueva.id, ...values }]);
      }

      setModalOpen(false);
    } catch {
      // Validación fallida
    }
  };

  const eliminarArea = async (id: string) => {
    if (!confirm("¿Eliminar esta área?")) return;
    await deleteDoc(doc(db, "areas", id));
    setAreas((prev) => prev.filter((a) => a.id !== id));
  };

  const editarArea = (area: Area) => {
    setEditando(area);
    form.setFieldsValue({ nombre: area.nombre, descripcion: area.descripcion });
    setModalOpen(true);
  };

  const abrirEditorUsuarios = (area: Area) => {
    const actuales = permisos[area.id] || [];
    setAreaSeleccionada(area);
    setUsuariosSeleccionados(actuales);
    setModalEdicion(true);
  };

  const guardarUsuarios = async () => {
    if (!areaSeleccionada) return;
    try {
      const areaID = areaSeleccionada.id;

      for (const usuario of usuarios) {
        const habilitado = usuariosSeleccionados.includes(usuario.id);
        await setDoc(doc(db, "permisos", `${usuario.id}_${areaID}`), {
          userID: usuario.id,
          areaID: areaID,
          habilitado,
        });
      }

      setPermisos((prev) => ({
        ...prev,
        [areaID]: [...usuariosSeleccionados],
      }));

      setModalEdicion(false);
      setAreaSeleccionada(null);
      message.success("Usuarios actualizados correctamente");
    } catch (e) {
      console.error("Error actualizando permisos", e);
      message.error("Ocurrió un error guardando los accesos");
    }
  };

  const columnas = [
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
      render: (text: string) =>
        text || <i style={{ color: "#999" }}>Sin descripción</i>,
    },
    {
      title: "Usuarios con acceso",
      key: "usuarios",
      render: (_: unknown, area: Area) => {
        const usuariosIds = permisos[area.id] || [];
        const nombres = usuariosIds
          .map((id) => usuarios.find((u) => u.id === id)?.nombre)
          .filter(Boolean);

        const primeros = nombres.slice(0, 10);
        const restantes = nombres.length > 10 ? nombres.length - 10 : 0;

        return (
          <Space direction="vertical">
            <Space wrap>
              {primeros.map((nombre, idx) => (
                <Tag key={idx} color="geekblue">
                  {nombre}
                </Tag>
              ))}
              {restantes > 0 && (
                <Button
                  type="link"
                  icon={<TeamOutlined />}
                  onClick={() => {
                    setAreaSeleccionada(area);
                    setModalUsuarios(true);
                  }}
                >
                  Ver más ({restantes})
                </Button>
              )}
              {nombres.length === 0 && (
                <span style={{ color: "#999" }}>Sin usuarios</span>
              )}
            </Space>
            <Button
              size="small"
              icon={<UserSwitchOutlined />}
              onClick={() => abrirEditorUsuarios(area)}
            >
              Editar usuarios
            </Button>
          </Space>
        );
      },
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: unknown, record: Area) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => editarArea(record)}>
            Editar
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => eliminarArea(record.id)}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{ padding: 32, backgroundColor: "#f6f8fa", minHeight: "100vh" }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Gestión de Áreas
            </Typography.Title>
            <Typography.Text type="secondary">
              Administra las áreas de tu organización
            </Typography.Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={abrirNuevo}>
            Nueva Área
          </Button>
        </div>

        <Card
          style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
        >
          {areas.length === 0 ? (
            <Empty description="No hay áreas registradas" />
          ) : (
            <Table
              dataSource={areas}
              columns={columnas}
              rowKey="id"
              pagination={{ pageSize: 6 }}
            />
          )}
        </Card>

        <Modal
          title={editando ? "Editar Área" : "Nueva Área"}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={guardarArea}
          okText={editando ? "Actualizar" : "Guardar"}
        >
          <Form layout="vertical" form={form}>
            <Form.Item
              label="Nombre"
              name="nombre"
              rules={[{ required: true, message: "El nombre es obligatorio" }]}
            >
              <Input placeholder="Nombre del área" />
            </Form.Item>
            <Form.Item label="Descripción" name="descripcion">
              <Input placeholder="Breve descripción (opcional)" />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={`Usuarios con acceso a: ${areaSeleccionada?.nombre}`}
          open={modalUsuarios}
          onCancel={() => setModalUsuarios(false)}
          footer={null}
        >
          <ul>
            {(permisos[areaSeleccionada?.id || ""] || [])
              .map((id) => usuarios.find((u) => u.id === id)?.nombre)
              .filter(Boolean)
              .map((nombre, idx) => (
                <li key={idx}>{nombre}</li>
              ))}
          </ul>
        </Modal>

        <Modal
          title={`Editar usuarios para: ${areaSeleccionada?.nombre}`}
          open={modalEdicion}
          onCancel={() => setModalEdicion(false)}
          onOk={guardarUsuarios}
          okText="Guardar"
          cancelText="Cancelar"
        >
          <Checkbox.Group
            value={usuariosSeleccionados}
            onChange={(val) => setUsuariosSeleccionados(val as string[])}
          >
            {usuarios
              .sort((a, b) => a.nombre.localeCompare(b.nombre))
              .map((user) => (
                <div key={user.id} style={{ marginBottom: 6 }}>
                  <Checkbox value={user.id}>{user.nombre}</Checkbox>
                </div>
              ))}
          </Checkbox.Group>
        </Modal>
      </div>
    </div>
  );
}
