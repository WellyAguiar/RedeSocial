import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getAuth, signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useTheme } from "../contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import styles from "../styles/Navbar.module.css";
import Link from "next/link";

export default function Navbar({ user, username, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const [unseenMessages, setUnseenMessages] = useState([]);
  const [unseenUsers, setUnseenUsers] = useState(0);
  const router = useRouter();
  const auth = getAuth();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out");
        router.push("/auth");
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  const toggleNavbar = () => {
    setExpanded(!expanded);
    onToggle(!expanded);
  };

  useEffect(() => {
    const navbarElement = document.querySelector(`.${styles.collapsed}`);
    if (expanded) {
      navbarElement.classList.add(styles.expanded);
    } else {
      navbarElement.classList.remove(styles.expanded);
    }
  }, [expanded]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", user.uid),
      where("seen", "==", false)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const groupedMessages = messages.reduce((acc, message) => {
        const otherParticipant = message.participants.find(
          (p) => p !== user.uid
        );
        if (message.sender !== user.uid) {  // Only count if the user is not the sender
          if (!acc[otherParticipant]) {
            acc[otherParticipant] = [];
          }
          acc[otherParticipant].push(message);
        }
        return acc;
      }, {});

      // Fetch usernames for the other participants
      const unseenMessagesWithUsernames = await Promise.all(
        Object.entries(groupedMessages).map(async ([userId, messages]) => {
          const userDoc = await getDoc(doc(db, "users", userId));
          const senderName = userDoc.exists()
            ? userDoc.data().username
            : "Unknown";
          return { userId, senderName, count: messages.length };
        })
      );

      setUnseenMessages(unseenMessagesWithUsernames);
      setUnseenUsers(unseenMessagesWithUsernames.length);
    });

    return () => unsubscribe();
  }, [user]);

  const handleChatRedirect = (userId) => {
    router.push(`/chat/${userId}`);
  };

  return (
    <div
      className={`${styles.collapsed} ${styles.navbar}`}
      onClick={toggleNavbar}
    >
      {expanded && (
        <div className={styles.content}>
          {user ? (
            <Link href={`/profile/${user.uid}`} legacyBehavior>
              <a className={styles.username}>{username}</a>
            </Link>
          ) : (
            <div className={styles.username}>Guest</div>
          )}
          {unseenMessages.length > 0 && (
            <div className={styles.unseenMessages}>
              {unseenMessages.map(({ userId, senderName, count }) => (
                <div
                  key={userId}
                  onClick={() => handleChatRedirect(userId)}
                  className={styles.messageItem}
                >
                  {senderName} ({count})
                </div>
              ))}
            </div>
          )}
          <div className={styles.bottomButtons}>
            <ThemeToggle />
            {user && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                className={styles.logoutButton}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
      {!expanded && unseenUsers > 0 && (
        <div className={styles.unseenCount}>{unseenUsers}</div>
      )}
    </div>
  );
}
