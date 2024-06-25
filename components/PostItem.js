import Link from 'next/link';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import styles from '../styles/PostItem.module.css';
import { useRouter } from 'next/router';

export default function PostItem({ post, user, handleLike }) {
  const [username, setUsername] = useState('Unknown User');
  const [originalPost, setOriginalPost] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUsername() {
      if (post.userId) {
        const userDoc = await getDoc(doc(db, 'users', post.userId));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      }
    }
    fetchUsername();

    if (post.responseTo) {
      async function fetchOriginalPost() {
        try {
          const postDoc = await getDoc(doc(db, 'posts', post.responseTo));
          if (postDoc.exists()) {
            setOriginalPost(postDoc.data());
          } else {
            console.error('Original post not found');
          }
        } catch (error) {
          console.error('Error fetching original post:', error);
        }
      }
      fetchOriginalPost();
    }
  }, [post.userId, post.responseTo]);

  const navigateToPost = () => {
    router.push(`/posts/${post.id}`);
  };

  return (
    <li 
      className={styles.postItem} 
      style={{ backgroundColor: post.userId === user?.uid ? 'var(--highlight-bg)' : 'var(--post-bg)' }}
      onClick={navigateToPost}
    >
      {post.responseTo && (
        <div className={styles.responseIndicator}>
          Response to <Link href={`/posts/${post.responseTo}`} legacyBehavior><a className={styles.originalPostLink} onClick={e => e.stopPropagation()}>this post</a></Link>
        </div>
      )}
      <span className={styles.username}>
        <Link href={`/profile/${post.userId}`} legacyBehavior>
          <a className={styles.profileLink} onClick={e => e.stopPropagation()}>{username}</a>
        </Link>
      </span>
      <p>{post.content}</p>
      <div className={styles.postFooter}>
        <button
          onClick={(e) => { e.stopPropagation(); handleLike(post); }}
          className={`${styles.likeButton} ${post.likedBy?.includes(user?.uid) ? styles.liked : ''}`}
        >
          ❤ {post.likes || 0}
        </button>
        <span className={styles.responseCount}>{post.responses?.length || 0} responses</span>
      </div>
    </li>
  );
}
