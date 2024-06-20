import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import styles from '../styles/Form.module.css';

export default function EmailAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = getAuth();

  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        console.log(userCredential.user);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        console.log(userCredential.user);
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <div className={styles.authContainer}>
      <h2>Email Authentication</h2>
      <form className={styles.form}>
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="Email" 
          className={styles.input} 
        />
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="Password" 
          className={styles.input} 
        />
        <button onClick={handleSignUp} className={styles.button}>Sign Up</button>
        <button onClick={handleSignIn} className={styles.button}>Sign In</button>
      </form>
    </div>
  );
}
