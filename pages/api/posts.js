import { db } from '../../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { title, content, responseTo } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    try {
      const newPost = {
        title,
        content,
        responseTo: responseTo || null,
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        responses: []
      };

      const docRef = await addDoc(collection(db, 'posts'), newPost);

      // Update the original post to include the new response ID
      if (responseTo) {
        const originalPostRef = doc(db, 'posts', responseTo);
        await updateDoc(originalPostRef, {
          responses: arrayUnion(docRef.id)
        });
      }

      res.status(201).json({ id: docRef.id, ...newPost });
    } catch (error) {
      console.error('Error adding document: ', error);
      res.status(500).json({ error: 'Failed to save post' });
    }
  } else if (req.method === 'GET') {
    try {
      const querySnapshot = await getDocs(collection(db, 'posts'));
      const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(posts);
    } catch (error) {
      console.error('Error getting documents: ', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
