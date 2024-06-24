import { useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import styles from '../styles/Auth.module.css';

export default function EmailAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = getAuth();
  const router = useRouter();

  const handleSignUp = async () => {
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      router.push('/set-username'); // Redireciona para a página de configuração do username após a criação da conta
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  const handleSignIn = async () => {
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2>Email Authentication</h2>
      <form className={styles.formContainer} onSubmit={(e) => e.preventDefault()}>
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="Email" 
          className={styles.formInput} 
        />
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="Password" 
          className={styles.formInput} 
        />
        {error && <p className={styles.errorMessage}>{error}</p>}
        <button onClick={handleSignUp} className={styles.formButton}>Sign Up</button>
        <button onClick={handleSignIn} className={styles.formButton}>Sign In</button>
      </form>
    </div>
  );
}
