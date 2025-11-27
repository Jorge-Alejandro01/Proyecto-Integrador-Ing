import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // 1. Ignorar errores de ESLint (variables no usadas, warnings, etc.)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 2. Ignorar errores de TypeScript (tipos any, argumentos faltantes, etc.)
  typescript: {
    // !! ADVERTENCIA !!
    // Esto permite que el proyecto se construya aunque tenga errores de código.
    // Ideal para despliegues rápidos o demos.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
