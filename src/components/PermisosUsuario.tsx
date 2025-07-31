"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/services/firebaseConfig';
import styles from './interfaces/PermisosUsuario.module.css';

interface Zone {
  id: string;
  name: string;
  schedule: string;
  hasAccess: boolean;
}

interface UserData {
  id: string;
  nombre: string;
  matricula: string;
  zonasPermitidas: string[];
}

const PermisosUsuario = ({ params }: { params: { userId: string } }) => {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener datos del usuario
        const userDoc = await getDoc(doc(db, 'users', params.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserData;
          setUser({
            ...userData,
            id: userDoc.id
          });

          // Obtener todas las zonas disponibles
          const zonesSnapshot = await getDoc(doc(db, 'config', 'zones'));
          if (zonesSnapshot.exists()) {
            const allZones = zonesSnapshot.data().list as Zone[];
            setZones(
              allZones.map(zone => ({
                ...zone,
                hasAccess: userData.zonasPermitidas?.includes(zone.id) || false
              }))
            );
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.userId]);

  const handleToggleAccess = (zoneId: string) => {
    setZones(prevZones =>
      prevZones.map(zone =>
        zone.id === zoneId ? { ...zone, hasAccess: !zone.hasAccess } : zone
      )
    );
  };

  const handleSavePermissions = async () => {
    if (!user) return;

    try {
      const allowedZones = zones
        .filter(zone => zone.hasAccess)
        .map(zone => zone.id);

      await updateDoc(doc(db, 'users', user.id), {
        zonasPermitidas: allowedZones
      });

      alert('Permisos actualizados correctamente');
      router.push('/registro-usuarios');
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('Error al actualizar permisos');
    }
  };

  if (loading) {
    return <div className={styles.container}>Cargando...</div>;
  }

  if (!user) {
    return <div className={styles.container}>Usuario no encontrado</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Control de Acceso</h1>
        <button 
          onClick={() => router.push('/registro-usuarios')} 
          className={styles.backButton}
        >
          ← Volver
        </button>
      </div>

      <div className={styles.userInfo}>
        <h2 className={styles.userName}>{user.nombre}</h2>
        <p className={styles.userMatricula}>Matrícula: {user.matricula}</p>
      </div>

      <div className={styles.zonesContainer}>
        {zones.map(zone => (
          <div key={zone.id} className={styles.zoneCard}>
            <div className={styles.zoneHeader}>
              <h3 className={styles.zoneName}>{zone.name}</h3>
              <label className={styles.toggleSwitch}>
                <input 
                  type="checkbox" 
                  checked={zone.hasAccess}
                  onChange={() => handleToggleAccess(zone.id)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <p className={styles.zoneSchedule}>Horario: {zone.schedule}</p>
          </div>
        ))}
      </div>

      <button 
        onClick={handleSavePermissions}
        className={styles.saveButton}
      >
        Guardar Cambios
      </button>
    </div>
  );
};

export default PermisosUsuario;