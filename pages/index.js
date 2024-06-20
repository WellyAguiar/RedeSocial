import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import styles from '../styles/Home.module.css';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import Navbar from '../components/Navbar';

export default function Home({ user }) {
  const [posts, setPosts] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [username, setUsername] = useState('');
  const auth = getAuth();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPosts(postsData);
        
        const userIds = [...new Set(postsData.map(post => post.userId))];
        const usernamesData = {};
        for (const userId of userIds) {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            usernamesData[userId] = userDoc.data().username;
          }
        }
        setUsernames(usernamesData);

        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUsername(userDoc.data().username);
          }
        }
      } catch (error) {
        console.error("Error fetching posts or usernames: ", error);
      }
    }
    fetchPosts();
  }, [user]);

  const truncateContent = (content, maxLength) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className={styles.container}>
      <Navbar user={user} username={username} />
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>FaceWelly</h1>
          {user && (
            <Link href="/create" legacyBehavior>
              <a className={styles.createPostLink}>Create New Post</a>
            </Link>
          )}
        </div>
        <ul className={styles.postList}>
          {posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`} legacyBehavior>
              <a className={styles.postItem}>
                <li style={{ backgroundColor: post.userId === user?.uid ? 'var(--highlight-bg)' : 'var(--post-bg)' }}>
                  <h2><span className={styles.username}>{usernames[post.userId] || 'Unknown User'}:</span> {post.title}</h2>
                  <p>{truncateContent(post.content, 200)}</p>
                </li>
              </a>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}
