import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../../styles/Post.module.css";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  collection,
} from "firebase/firestore";

export default function PostDetails({ user }) {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [response, setResponse] = useState("");
  const [userLiked, setUserLiked] = useState(false);
  const [usernames, setUsernames] = useState({});

  useEffect(() => {
    if (id) {
      async function fetchPost() {
        try {
          const docRef = doc(db, "posts", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const postData = docSnap.data();
            setPost({ id: docSnap.id, ...postData });
            setUserLiked(postData.likedBy?.includes(user?.uid));
            
            // Fetch the username of the post author
            const postAuthorDoc = await getDoc(doc(db, "users", postData.userId));
            if (postAuthorDoc.exists()) {
              setUsernames(prevUsernames => ({
                ...prevUsernames,
                [postData.userId]: postAuthorDoc.data().username,
              }));
            }

            // Fetch the responses
            if (postData.responses?.length > 0) {
              const responseDocs = await Promise.all(
                postData.responses.map((responseId) =>
                  getDoc(doc(db, "posts", responseId))
                )
              );
              const responsesData = responseDocs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setPost((prevPost) => ({ ...prevPost, responses: responsesData }));

              // Fetch usernames for the responses
              const userIds = responsesData.map(response => response.userId);
              const uniqueUserIds = [...new Set(userIds)];
              const usernamesData = {};
              for (const userId of uniqueUserIds) {
                if (userId) {
                  const userDoc = await getDoc(doc(db, "users", userId));
                  if (userDoc.exists()) {
                    usernamesData[userId] = userDoc.data().username;
                  }
                }
              }
              setUsernames(prevUsernames => ({
                ...prevUsernames,
                ...usernamesData
              }));
            }
          } else {
            throw new Error("Post not found");
          }
        } catch (error) {
          console.error("Error fetching post:", error);
        }
      }
      fetchPost();
    }
  }, [id, user]);

  const handleLike = async () => {
    if (user) {
      const postRef = doc(db, "posts", post.id);
      if (userLiked) {
        await updateDoc(postRef, {
          likes: post.likes - 1,
          likedBy: arrayRemove(user.uid),
        });
        setPost((prevPost) => ({
          ...prevPost,
          likes: prevPost.likes - 1,
          likedBy: prevPost.likedBy.filter((uid) => uid !== user.uid),
        }));
      } else {
        await updateDoc(postRef, {
          likes: post.likes + 1,
          likedBy: arrayUnion(user.uid),
        });
        setPost((prevPost) => ({
          ...prevPost,
          likes: prevPost.likes + 1,
          likedBy: [...(prevPost.likedBy || []), user.uid],
        }));
      }
      setUserLiked(!userLiked);
    } else {
      alert("You must be logged in to like a post");
    }
  };

  const handleAddResponse = async () => {
    if (response.trim()) {
      const newResponse = {
        userId: user.uid,
        content: response,
        responseTo: post.id,
        createdAt: new Date().toISOString(),
        likes:0,
      };
      const responseDocRef = await addDoc(collection(db, "posts"), newResponse);

      // Update the original post to include the new response ID
      await updateDoc(doc(db, "posts", post.id), {
        responses: arrayUnion(responseDocRef.id),
      });

      setResponse("");
      // Update the post to include the new response
      setPost((prevPost) => ({
        ...prevPost,
        responses: prevPost.responses
          ? [...prevPost.responses, { id: responseDocRef.id, ...newResponse }]
          : [{ id: responseDocRef.id, ...newResponse }],
      }));

      // Fetch the username of the new response author
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUsernames(prevUsernames => ({
          ...prevUsernames,
          [user.uid]: userDoc.data().username,
        }));
      }
    }
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.postContent}>
        <span className={styles.username}>
          {usernames[post.userId] || "Unknown User"}
        </span>
        <p>{post.content}</p>
        <div className={styles.postFooter}>
          <button
            onClick={handleLike}
            className={`${styles.likeButton} ${userLiked ? styles.liked : ""}`}
          >
            ❤ {post.likes || 0}
          </button>
        </div>
      </div>
      <div className={styles.responses}>
        <h2>Responses</h2>
        {post.responses &&
          post.responses
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Ordenar por data
            .map((res, index) => (
              <div key={index} className={styles.response}>
                <span className={styles.username}>
                  {usernames[res.userId] || "Unknown User"}
                </span>
                <p>{res.content}</p>
              </div>
            ))}
        {user && (
          <div className={styles.addResponse}>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Add a response"
            />
            <button onClick={handleAddResponse} className={styles.button}>
              Submit
            </button>
          </div>
        )}
      </div>
      <Link href="/" legacyBehavior>
        <a className={styles.backButton}>Back to Home</a>
      </Link>
    </div>
  );
}
