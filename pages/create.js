import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import styles from "../styles/Form.module.css";

export default function CreatePost({ user }) {
  const [content, setContent] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      }
    };
    fetchUsername();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to create a post");
      return;
    }
    try {
      await addDoc(collection(db, "posts"), {
        content,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
      });
      router.push("/");
    } catch (error) {
      console.error("Error creating post: ", error);
      alert("Failed to create post");
    }
  };

  return (
    <div className={styles.container}>
      <h1>Create Post</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={styles.textarea}
        />
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.button}>
            Create
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
