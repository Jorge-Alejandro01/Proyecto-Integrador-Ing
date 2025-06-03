//import LoginForm from "../components/LoginForm";
import RegistroUsers from "../interfaces/RegistroUsers";
import styles from "./page.module.css";
//import PermisosUsers from "../components/PermisosUsers";
export default function Home() {
  return (
    <div className={styles.page}>
      <RegistroUsers />
    </div>
  );
}
