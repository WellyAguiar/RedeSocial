import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../../styles/Post.module.css';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export default function PostDetails({ user }) {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [response, setResponse] = useState('');
  const [userLiked, setUserLiked] = useState(false);
  const [usernames, setUsernames] = useState({});

  useEffect(() => {
    if (id) {
      async function fetchPost() {
        try {
          const docRef = doc(db, 'posts', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const postData = docSnap.data();
            setPost({ id: docSnap.id, ...postData });
            setUserLiked(postData.likedBy?.includes(user?.uid));
            fetchUsernames(postData.responses || []); // Garantir que responses é um array
          } else {
            throw new Error('Post not found');
          }
        } catch (error) {
          console.error('Error fetching post:', error);
        }
      }
      fetchPost();
    }
  }, [id, user]);

  const fetchUsernames = async (responses) => {
    const usernamesData = {};
    const userIds = responses ? responses.map((res) => res.userId) : [];
    const uniqueUserIds = [...new Set(userIds)];
    for (const userId of uniqueUserIds) {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        usernamesData[userId] = userDoc.data().username;
      }
    }
    setUsernames(usernamesData);
  };

  const handleLike = async () => {
    if (user) {
      const postRef = doc(db, 'posts', post.id);
      if (userLiked) {
        await updateDoc(postRef, {
          likes: post.likes - 1,
          likedBy: arrayRemove(user.uid)
        });
        setPost((prevPost) => ({
          ...prevPost,
          likes: prevPost.likes - 1,
          likedBy: prevPost.likedBy.filter((uid) => uid !== user.uid)
        }));
      } else {
        await updateDoc(postRef, {
          likes: post.likes + 1,
          likedBy: arrayUnion(user.uid)
        });
        setPost((prevPost) => ({
          ...prevPost,
          likes: prevPost.likes + 1,
          likedBy: [...prevPost.likedBy, user.uid]
        }));
      }
      setUserLiked(!userLiked);
    } else {
      alert('You must be logged in to like a post');
    }
  };

  const handleAddResponse = async () => {
    if (response.trim()) {
      const postRef = doc(db, 'posts', post.id);
      const newResponse = { userId: user.uid, response, createdAt: new Date().toISOString() };
      await updateDoc(postRef, {
        responses: arrayUnion(newResponse)
      });
      setPost((prevPost) => ({
        ...prevPost,
        responses: prevPost.responses 
          ? [...prevPost.responses, newResponse] 
          : [newResponse]
      }));
      setResponse('');
      fetchUsernames([...post.responses || [], newResponse]); // Garantir que responses é um array
    }
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.postContent}>
        <span className={styles.username}>{usernames[post.userId] || 'Unknown User'}</span>
        <p>{post.content}</p>
        <div className={styles.postFooter}>
          <button
            onClick={handleLike}
            className={`${styles.likeButton} ${userLiked ? styles.liked : ''}`}
          >
            ❤ {post.likes || 0}
          </button>
        </div>
      </div>
      <div className={styles.responses}>
        <h2>Responses</h2>
        {post.responses && post.responses.map((res, index) => (
          <div key={index} className={styles.response}>
            <span className={styles.username}>{usernames[res.userId] || 'Unknown User'}</span>
            <p>{res.response}</p>
          </div>
        ))}
        {user && (
          <div className={styles.addResponse}>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Add a response"
            />
            <button onClick={handleAddResponse} className={styles.button}>Submit</button>
          </div>
        )}
      </div>
      <Link href="/" legacyBehavior>
        <a className={styles.backButton}>Back to Home</a>
      </Link>
    </div>
  );
}
