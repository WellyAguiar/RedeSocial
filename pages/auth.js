import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import EmailAuth from './EmailAuth';
import PhoneAuth from './PhoneAuth';
import styles from '../styles/Form.module.css';

export default function Auth({ user }) {
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return (
    <div className="App">
      <div className="auth-wrapper">
        <EmailAuth />
        <PhoneAuth />
      </div>
    </div>
  );
}
  