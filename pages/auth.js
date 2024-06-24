import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import EmailAuth from './EmailAuth';
import PhoneAuth from './PhoneAuth';
import ThemeToggle from '../components/ThemeToggle';
import { motion } from 'framer-motion';
import styles from '../styles/Auth.module.css';

export default function Auth() {
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().username) {
          router.push('/'); // Redireciona para a página inicial se o username já estiver definido
        } else {
          router.push('/edit-profile'); // Redireciona para a página de configuração do username
        }
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  return (
    <div className={styles.App}>
      <ThemeToggle />
      <div className={styles.authWrapper}>
        {!isEmailOpen && !isPhoneOpen && (
          <>
            <motion.div
              layout
              initial={{ borderRadius: 10 }}
              className={styles.authOption}
              onClick={() => setIsEmailOpen(true)}
            >
              <button className={styles.authButton}>Login com Email</button>
            </motion.div>
            <motion.div
              layout
              initial={{ borderRadius: 10 }}
              className={styles.authOption}
              onClick={() => setIsPhoneOpen(true)}
            >
              <button className={styles.authButton}>Login com Telefone</button>
            </motion.div>
          </>
        )}
        {isEmailOpen && (
          <motion.div layout initial={{ borderRadius: 10 }} className={styles.authOption}>
            <EmailAuth />
            <button onClick={() => setIsEmailOpen(false)} className={styles.authButton}>Voltar</button>
          </motion.div>
        )}
        {isPhoneOpen && (
          <motion.div layout initial={{ borderRadius: 10 }} className={styles.authOption}>
            <PhoneAuth />
            <button onClick={() => setIsPhoneOpen(false)} className={styles.authButton}>Voltar</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
