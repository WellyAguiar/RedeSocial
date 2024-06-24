import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getAuth, signOut } from "firebase/auth";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import styles from "../styles/Navbar.module.css";
import Link from "next/link";

export default function Navbar({ user, username, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out");
        router.push("/auth");
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  const toggleNavbar = () => {
    setExpanded(!expanded);
    onToggle(!expanded);
  };

  // Adicionar ou remover a classe de navbar
  useEffect(() => {
    const navbarElement = document.querySelector(`.${styles.collapsed}`);
    if (expanded) {
      navbarElement.classList.add(styles.expanded);
    } else {
      navbarElement.classList.remove(styles.expanded);
    }
  }, [expanded]);

  return (
    <div
      className={`${styles.collapsed} ${styles.navbar}`}
      onClick={toggleNavbar}
    >
      {expanded && (
        <div className={styles.content}>
          <Link href={`/profile/${user.uid}`} legacyBehavior>
            <a className={styles.username}>{username}</a>
          </Link>
          <div className={styles.bottomButtons}>
            <ThemeToggle />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              className={styles.logoutButton}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
