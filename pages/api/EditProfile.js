import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import styles from "../../styles/Form.module.css";

export default function EditProfile() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const auth = getAuth();
  const router = useRouter();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUsername(data.username);
            setName(data.name || "");
            setAge(data.age || "");
            setGender(data.gender || "");
            setBio(data.bio || "");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    setError("");
    setSuccess("");
    if (user) {
      if (username.trim() === "") {
        setError("Username is required.");
        return;
      }
      try {
        await setDoc(doc(db, "users", user.uid), {
          username,
          name,
          age,
          gender,
          bio,
          userId: user.uid,
        });
        setSuccess("Profile updated successfully!");
        router.push(`/profile/${user.uid}`); // Redireciona para a página do perfil após salvar as alterações
      } catch (error) {
        console.error(error);
        setError(error.message);
      }
    } else {
      setError("No user is signed in.");
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2>Edit Profile</h2>
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className={styles.input}
          required
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className={styles.input}
        />
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Age"
          className={styles.input}
        />
        <input
          type="text"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          placeholder="Gender"
          className={styles.input}
        />
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio"
          className={styles.input}
        />
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <button onClick={handleSaveProfile} className={styles.button}>
          Save Profile
        </button>
      </form>
    </div>
  );
}
