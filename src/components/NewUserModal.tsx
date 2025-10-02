"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input } from "antd";

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
  onSave: (user: User | Omit<User, "id">) => void;
  user?: User | null;
}

const NewUserModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
}) => {
  const [form] = Form.useForm(); // Mover esta línea dentro del componente

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        nombre: user.nombre,
        matricula: user.matricula,
      });
    } else {
      form.resetFields();
    }
  }, [user, isOpen, form]);

  const handleSubmit = async () => {
    {
      const values = await form.validateFields();
      onSave(user ? { ...values, id: user.id } : values);
      onClose();
    }
  };

  return (
    <Modal
      title={user ? "Editar Usuario" : "Nuevo Usuario"}
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={user ? "Actualizar" : "Guardar"}
      cancelText="Cancelar"
    >
      <Form layout="vertical" form={form}>
        {" "}
        {/* Asegúrate de pasar la prop form */}
        <Form.Item
          label="Nombre Completo"
          name="nombre"
          rules={[{ required: true, message: "El nombre es obligatorio" }]}
        >
          <Input placeholder="Ej: Juan Pérez" />
        </Form.Item>
        <Form.Item
          label="Matrícula"
          name="matricula"
          rules={[{ required: true, message: "La matrícula es obligatoria" }]}
        >
          <Input placeholder="Ej: 123456" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewUserModal;
