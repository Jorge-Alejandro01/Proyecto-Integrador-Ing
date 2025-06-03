"use client";

import styles from "@/src/components/LoginForm.module.css";

export default function LoginForm() {
  return (
    <div className={styles.container}>
      <form className={styles.form}>
        <h2 className={styles.title}>Bienvenido</h2>

        <div className={styles.inputGroup}>
          <label>Usuario</label>
          <input type="text" required />
        </div>

        <div className={styles.inputGroup}>
          <label>Contraseña</label>
          <input type="password" required />
        </div>

        <button type="submit" className={styles.button}>
          Iniciar Sesión
        </button>
        <div>
          <br />
          <button className={styles.button}>
            Olvidaste tu Usuario o Contraseña?
          </button>
        </div>
      </form>
    </div>
  );
}
