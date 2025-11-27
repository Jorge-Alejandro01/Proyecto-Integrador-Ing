"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input, message } from "antd";

interface Area {
  id: string;
  nombre: string;
  descripcion: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (area: Omit<Area, "id">) => void;
  area?: Area | null;
}

const AreaModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, area }) => {
    const [form] = Form.useForm();

    // Precarga los campos si estamos en modo edición
    useEffect(() => {
        if (area) {
        form.setFieldsValue({
            nombre: area.nombre,
            descripcion: area.descripcion || "", //cambio aqui para ejecutar en vercel
        });
        } else {
        form.resetFields();
        }
    }, [area, isOpen, form]);

    const handleSubmit = async () => {
        try {
        const values = await form.validateFields();
        onSave(values as Omit<Area, "id">);
        onClose();
        } catch (_error) {
          console.log("Error de validación:", _error); //cambio aqui para ejecutar en vercel
          message.error("Por favor complete los campos requeridos.");
        }
    };

        return (
            <Modal
            title={area ? "Editar Área" : "Nueva Área"}
            open={isOpen}
            onCancel={onClose}
            onOk={handleSubmit}
            okText={area ? "Actualizar" : "Guardar"}
            cancelText="Cancelar"
            >
            <Form layout="vertical" form={form}>
                <Form.Item
                label="Nombre del Área"
                name="nombre"
                rules={[{ required: true, message: "El nombre del área es obligatorio" }]}
                >
                <Input placeholder="Ej: Laboratorio, Oficina, Almacén" />
                </Form.Item>
                <Form.Item
                label="Descripción"
                name="descripcion"
                >
                <Input.TextArea placeholder="Breve descripción del área" rows={2} />
                </Form.Item>
            </Form>
            </Modal>
        );
};

export default AreaModal;
