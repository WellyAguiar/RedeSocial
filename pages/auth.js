import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import EmailAuth from './EmailAuth';
import PhoneAuth from './PhoneAuth';
import ThemeToggle from '../components/ThemeToggle'; // Importar o botão de alternância de tema
import styles from '../styles/Form.module.css';

export default function Auth() {
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().username) {
          router.push('/'); // Redireciona para a página inicial se o username já estiver definido
        } else {
          router.push('/set-username'); // Redireciona para a página de configuração do username
        }
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  return (
    <div className="App">
      <ThemeToggle /> {/* Adicionar o botão de alternância de tema */}
      <div className="auth-wrapper">
        <EmailAuth />
        <PhoneAuth />
      </div>
    </div>
  );
}
