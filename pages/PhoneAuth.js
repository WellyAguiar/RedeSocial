import { useState } from 'react';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import styles from '../styles/Form.module.css';

export default function PhoneAuth() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const auth = getAuth();

  const setUpRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth,'recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        console.log("Recaptcha verified");
      },
      'expired-callback': () => {
        console.error("Recaptcha expired");
      }
    });
  };

  const handleSendCode = (e) => {
    e.preventDefault();
    setUpRecaptcha();
    const appVerifier = window.recaptchaVerifier;

    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((result) => {
        setConfirmationResult(result);
        console.log("Code sent");
      })
      .catch((error) => {
        console.error("Error during signInWithPhoneNumber", error);
      });
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (confirmationResult) {
      confirmationResult.confirm(verificationCode)
        .then((result) => {
          console.log("User signed in successfully", result.user);
        })
        .catch((error) => {
          console.error("Error verifying code", error);
        });
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2>Phone Authentication</h2>
      <form onSubmit={handleSendCode} className={styles.form}>
        <input 
          type="tel" 
          value={phoneNumber} 
          onChange={(e) => setPhoneNumber(e.target.value)} 
          placeholder="Phone Number" 
          className={styles.input} 
        />
        <div id="recaptcha-container"></div>
        <button type="submit" className={styles.button}>Send Code</button>
      </form>
      <form onSubmit={handleVerifyCode} className={styles.form}>
        <input 
          type="text" 
          value={verificationCode} 
          onChange={(e) => setVerificationCode(e.target.value)} 
          placeholder="Verification Code" 
          className={styles.input} 
        />
        <button type="submit" className={styles.button}>Verify Code</button>
      </form>
    </div>
  );
}
