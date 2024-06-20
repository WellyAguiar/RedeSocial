// pages/posts/edit/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '/styles/Form.module.css';

export default function EditPost() {
  const router = useRouter();
  const { id } = router.query;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (id) {
      async function fetchPost() {
        const res = await fetch(`/api/posts/${id}`);
        const data = await res.json();
        setTitle(data.title);
        setContent(data.content);
      }
      fetchPost();
    }
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    });
    router.push(`/`);
  };

  const handleDelete = async () => {
    await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
    });
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <h1>Edit Post</h1>
      <form onSubmit={handleUpdate} className={styles.form}>
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
        <button type="submit" className={styles.button}>Update</button>
      </form>
      <button onClick={handleDelete} className={`${styles.button} ${styles.deleteButton}`}>
        Delete
      </button>
    </div>
  );
}
