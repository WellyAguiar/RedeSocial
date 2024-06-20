import { useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';
import styles from '../styles/Form.module.css';

export default function CreatePost({ user }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to create a post');
      return;
    }
    try {
      await addDoc(collection(db, 'posts'), {
        title,
        content,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      router.push('/');
    } catch (error) {
      console.error('Error creating post: ', error);
      alert('Failed to create post');
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <h1>Create Post</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={styles.textarea}
        />
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.button}>Create</button>
          <button type="button" onClick={handleCancel} className={`${styles.button} ${styles.cancelButton}`}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
