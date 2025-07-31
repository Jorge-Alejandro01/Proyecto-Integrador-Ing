"use client";

import React from "react";

const Areas: React.FC = () => {
  return (
    <div>
      <h1>Gestión de Áreas</h1>
      <table>
        <thead>
          <tr>
            <th>Áreas Disponibles</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ejemplo de Área</td>
            <td>
              <button>Acciones</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Areas;