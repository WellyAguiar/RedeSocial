import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import styles from '../styles/Home.module.css';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, updateDoc, query, orderBy, arrayUnion, arrayRemove } from 'firebase/firestore';
import Navbar from '../components/Navbar';

export default function Home({ user }) {
  const [posts, setPosts] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [username, setUsername] = useState('');
  const [isNavbarExpanded, setIsNavbarExpanded] = useState(false);
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

  const handleLike = async (post) => {
    if (user) {
      const postRef = doc(db, 'posts', post.id);
      const userLiked = post.likedBy ? post.likedBy.includes(user.uid) : false;

      if (userLiked) {
        await updateDoc(postRef, {
          likes: post.likes - 1,
          likedBy: arrayRemove(user.uid)
        });
        setPosts(posts.map(p => p.id === post.id ? { ...p, likes: p.likes - 1, likedBy: p.likedBy.filter(uid => uid !== user.uid) } : p));
      } else {
        await updateDoc(postRef, {
          likes: post.likes + 1,
          likedBy: arrayUnion(user.uid)
        });
        setPosts(posts.map(p => p.id === post.id ? { ...p, likes: p.likes + 1, likedBy: [...(p.likedBy || []), user.uid] } : p));
      }
    } else {
      alert('You must be logged in to like a post');
    }
  };

  const handleNavbarToggle = (expanded) => {
    setIsNavbarExpanded(expanded);
  };

  return (
    <div className={styles.container}>
      <Navbar user={user} username={username} onToggle={handleNavbarToggle} />
      <div className={`${styles.mainContent} ${isNavbarExpanded ? styles.expanded : ''}`}>
        <div className={styles.header}>
          <h1>Wellytter</h1>
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
                  <span className={styles.username}>{usernames[post.userId] || 'Unknown User'}</span>
                  <p>{truncateContent(post.content, 200)}</p>
                  <div className={styles.postFooter}>
                    <button
                      onClick={(e) => { e.preventDefault(); handleLike(post); }}
                      className={`${styles.likeButton} ${post.likedBy?.includes(user?.uid) ? styles.liked : ''}`}
                    >
                      ❤ {post.likes || 0}
                    </button>
                    <span className={styles.responseCount}>{post.responses?.length || 0} responses</span>
                  </div>
                </li>
              </a>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}
