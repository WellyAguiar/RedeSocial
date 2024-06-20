import { useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import styles from '../../styles/Form.module.css';

export default function SetUsername() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const auth = getAuth();
  const router = useRouter();

  const handleSetUsername = async () => {
    setError('');
    setSuccess('');
    const user = auth.currentUser;
    if (user) {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usernames = querySnapshot.docs.map(doc => doc.data().username);
        if (usernames.includes(username)) {
          setError('Username already exists. Please choose another one.');
        } else {
          await setDoc(doc(db, 'users', user.uid), { username, userId: user.uid });
          setSuccess('Username set successfully!');
          router.push('/'); // Redireciona para a página inicial após configurar o username
        }
      } catch (error) {
        console.error(error);
        setError(error.message);
      }
    } else {
      setError('No user is signed in.');
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2>Set Username</h2>
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <input 
          type="text" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          placeholder="Username" 
          className={styles.input} 
        />
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <button onClick={handleSetUsername} className={styles.button}>Set Username</button>
      </form>
    </div>
  );
}
