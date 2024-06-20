import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../../styles/Post.module.css';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function PostDetails({ user }) {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (id) {
      async function fetchPost() {
        try {
          const docRef = doc(db, 'posts', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setPost({ id: docSnap.id, ...docSnap.data() });
          } else {
            throw new Error('Post not found');
          }
        } catch (error) {
          console.error('Error fetching post:', error);
        }
      }
      fetchPost();
    }
  }, [id]);

  if (!post) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{post.title}</h1>
        {user?.uid === post.userId && (
          <Link href={`/posts/edit/${post.id}`} legacyBehavior>
            <a>Edit</a>
          </Link>
        )}
      </div>
      <div className={styles.postContent}>
        <p>{post.content}</p>
      </div>
      <Link href="/" legacyBehavior>
        <a className={styles.backButton}>Back to Home</a>
      </Link>
    </div>
  );
}
