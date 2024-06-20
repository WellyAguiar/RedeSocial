import { useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth, signOut } from 'firebase/auth';
import { useTheme } from '../contexts/ThemeContext';
import styles from '../styles/Navbar.module.css';

export default function Navbar({ user, username }) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const auth = getAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    signOut(auth).then(() => {
      console.log("User signed out");
      router.push('/auth');
    }).catch((error) => {
      console.error("Error signing out: ", error);
    });
  };

  const toggleNavbar = () => {
    setExpanded(!expanded);
  };

  return (
    <div 
      className={expanded ? styles.expanded : styles.collapsed} 
      onClick={toggleNavbar}
    >
      {expanded && (
        <div className={styles.content}>
          <p onClick={(e) => { e.stopPropagation(); router.push('/set-username'); }} className={styles.username}>{username}</p>
          <div className={styles.bottomButtons}>
            <button onClick={(e) => { e.stopPropagation(); toggleTheme(); }} className={styles.themeToggle}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className={styles.logoutButton}>Logout</button>
          </div>
        </div>
      )}
    </div>
  );
}
