import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import styles from '../styles/Home.module.css';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Home({ user }) {
  const [posts, setPosts] = useState([]);
  const auth = getAuth();

  useEffect(() => {
    async function fetchPosts() {
      const querySnapshot = await getDocs(collection(db, 'posts'));
      const postsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    }
    fetchPosts();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      console.log("User signed out");
    }).catch((error) => {
      console.error("Error signing out: ", error);
    });
  };

  const truncateContent = (content, maxLength) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>FaceWelly</h1>
        {user && (
          <>
            <Link href="/create" legacyBehavior>
              <a>Create New Post</a>
            </Link>
            <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
          </>
        )}
      </div>
      <ul className={styles.postList}>
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`} legacyBehavior>
            <a className={styles.postItem}>
              <li style={{ backgroundColor: post.userId === user?.uid ? '#e0ffe0' : '#fff' }}>
                <h2>{post.title}</h2>
                <p>{truncateContent(post.content, 200)}</p>
              </li>
            </a>
          </Link>
        ))}
      </ul>
    </div>
  );
}
