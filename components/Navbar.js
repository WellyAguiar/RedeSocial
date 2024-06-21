import { useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth, signOut } from 'firebase/auth';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle'; // Importar o componente ThemeToggle
import styles from '../styles/Navbar.module.css';
import Link from 'next/link';

export default function Navbar({ user, username, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out");
        router.push('/auth');
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  const toggleNavbar = () => {
    setExpanded(!expanded);
    onToggle(!expanded); // Chama a função onToggle com o novo estado
  };

  return (
    <div className={expanded ? styles.expanded : styles.collapsed} onClick={toggleNavbar}>
      {expanded && (
        <div className={styles.content}>
          <Link href={`/profile/${user.uid}`} legacyBehavior>
            <a className={styles.username}>{username}</a>
        </Link>
          <div className={styles.bottomButtons}>
            <ThemeToggle /> {/* Adicionar o componente ThemeToggle */}
            <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className={styles.logoutButton}>Logout</button>
          </div>
        </div>
      )}
    </div>
  );
}
