import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebase";
import styles from "../../styles/Chat.module.css";

const Chat = () => {
  const [user, setUser] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const router = useRouter();
  const { userId } = router.query;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !userId) return;

    const fetchChatUser = async () => {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setChatUser(userDoc.data().username);
      }
    };

    fetchChatUser();

    const q = query(collection(db, "messages"), orderBy("timestamp"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      const filteredMessages = allMessages.filter(
        (message) =>
          message.participants.includes(user.uid) &&
          message.participants.includes(userId)
      );

      // Mark messages as seen
      filteredMessages.forEach(async (message) => {
        if (!message.seen && message.sender !== user.uid) {
          await updateDoc(doc(db, "messages", message.id), { seen: true });
        }
      });

      setMessages(filteredMessages);
    });

    return () => unsubscribe();
  }, [user, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await addDoc(collection(db, "messages"), {
      text: newMessage,
      sender: user.uid,
      participants: [user.uid, userId],
      timestamp: new Date(),
      seen: false
    });

    setNewMessage("");
    scrollToBottom();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return <p>Please log in to access the chat.</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href={`/profile/${userId}`} legacyBehavior>
          <a className={styles.chatUser}>{chatUser}</a>
        </Link>
        <button onClick={() => router.push('/')} className={styles.backButton}>Home</button>
      </div>
      <div className={styles.chatBox}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.sender === user.uid ? styles.sent : styles.received
            }
          >
            <p className={styles.messageText}>{message.text}</p>
            <span className={styles.timestamp}>
              {formatTime(message.timestamp)}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className={styles.inputForm}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className={styles.input}
          placeholder="Type a message"
        />
        <button type="submit" className={styles.button}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
