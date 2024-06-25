import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import Navbar from "../../components/Navbar";
import PostItem from "../../components/PostItem";
import styles from "../../styles/Profile.module.css";
import { motion, AnimatePresence } from "framer-motion";

export default function UserProfile({ user }) {
  const router = useRouter();
  const { id } = router.query;
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [responses, setResponses] = useState([]);
  const [isNavbarExpanded, setIsNavbarExpanded] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Posts");

  useEffect(() => {
    if (id) {
      async function fetchUserProfile() {
        try {
          const userDoc = await getDoc(doc(db, "users", id));
          if (userDoc.exists()) {
            setProfileUser(userDoc.data());
          }

          const userPostsQuery = query(
            collection(db, "posts"),
            where("userId", "==", id)
          );
          const userPostsSnapshot = await getDocs(userPostsQuery);
          const userPosts = userPostsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPosts(userPosts);

          const likedPostsQuery = query(
            collection(db, "posts"),
            where("likedBy", "array-contains", id)
          );
          const likedPostsSnapshot = await getDocs(likedPostsQuery);
          setLikedPosts(
            likedPostsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );

          const userResponses = userPosts.filter((post) => post.responseTo);
          setResponses(userResponses);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
      fetchUserProfile();
    }
  }, [id]);

  const handleLike = async (post) => {
    if (user) {
      const postRef = doc(db, "posts", post.id);
      const userLiked = post.likedBy ? post.likedBy.includes(user.uid) : false;

      if (userLiked) {
        await updateDoc(postRef, {
          likes: post.likes - 1,
          likedBy: arrayRemove(user.uid),
        });
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  likes: p.likes - 1,
                  likedBy: p.likedBy.filter((uid) => uid !== user.uid),
                }
              : p
          )
        );
        setResponses((prevResponses) =>
          prevResponses.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  likes: p.likes - 1,
                  likedBy: p.likedBy.filter((uid) => uid !== user.uid),
                }
              : p
          )
        );
      } else {
        await updateDoc(postRef, {
          likes: post.likes + 1,
          likedBy: arrayUnion(user.uid),
        });
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  likes: p.likes + 1,
                  likedBy: [...(p.likedBy || []), user.uid],
                }
              : p
          )
        );
        setResponses((prevResponses) =>
          prevResponses.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  likes: p.likes + 1,
                  likedBy: [...(p.likedBy || []), user.uid],
                }
              : p
          )
        );
      }
    } else {
      alert("You must be logged in to like a post");
    }
  };

  if (!profileUser) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <Navbar
        user={user}
        username={profileUser.username}
        onToggle={setIsNavbarExpanded}
      />
      <div
        className={`${styles.mainContent} ${
          isNavbarExpanded ? styles.expanded : ""
        }`}
      >
        <div className={styles.header}>
          <Link href="/" legacyBehavior>
            <a className={styles.backButton}>Back to Home</a>
          </Link>
          <h1>{profileUser.username}'s Profile</h1>
          {user && user.uid === id && (
            <Link href="/edit-profile" legacyBehavior>
              <a className={styles.editButton}>Edit Profile</a>
            </Link>
          )}
          {user && user.uid !== id && (
            <Link href={`/chat/${id}`} legacyBehavior>
              <a className={styles.messageButton}>Send Message</a>
            </Link>
          )}
        </div>
        <div className={styles.profileDetails}>
          <p>
            <strong>Name:</strong> {profileUser.name}
          </p>
          <p>
            <strong>Age:</strong> {profileUser.age}
          </p>
          <p>
            <strong>Gender:</strong> {profileUser.gender}
          </p>
          <p>
            <strong>Bio:</strong> {profileUser.bio}
          </p>
        </div>
        <nav className={styles.navbar}>
          <ul>
            {["Posts", "Liked Posts", "Responses"].map((tab) => (
              <li
                key={tab}
                className={tab === selectedTab ? "selected" : ""}
                onClick={() => setSelectedTab(tab)}
              >
                {tab}
                {tab === selectedTab && (
                  <motion.div
                    className={styles.underline}
                    layoutId="underline"
                  />
                )}
              </li>
            ))}
          </ul>
        </nav>
        <main>
          <AnimatePresence mode="wait">
            {selectedTab === "Posts" && (
              <motion.div
                key="posts"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.section}>
                  <h2>Posts</h2>
                  <ul>
                    {posts.map((post) => (
                      <PostItem
                        key={post.id}
                        post={post}
                        user={user}
                        handleLike={handleLike}
                      />
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
            {selectedTab === "Liked Posts" && (
              <motion.div
                key="liked-posts"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.section}>
                  <h2>Liked Posts</h2>
                  <ul>
                    {likedPosts.map((post) => (
                      <PostItem
                        key={post.id}
                        post={post}
                        user={user}
                        handleLike={handleLike}
                      />
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
            {selectedTab === "Responses" && (
              <motion.div
                key="responses"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.section}>
                  <h2>Responses</h2>
                  <ul>
                    {responses.map((post) => (
                      <PostItem
                        key={post.id}
                        post={post}
                        user={user}
                        handleLike={handleLike}
                      />
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
