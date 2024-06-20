import '@/styles/globals.css';
import '@/styles/Auth.css'; // Importação do CSS global movida para _app.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../firebase';

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user && router.pathname !== '/auth') {
        router.push('/auth');
      }
    });
    return () => unsubscribe();
  }, [router]);

  return <Component {...pageProps} user={user} />;
}

export default MyApp;
