import { db } from '../../../firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const docRef = doc(db, 'posts', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        res.status(200).json({ id: docSnap.id, ...docSnap.data() });
      } else {
        res.status(404).json({ error: 'Post not found' });
      }
    } catch (error) {
      console.error('Error getting document: ', error);
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  } else if (req.method === 'PUT') {
    const { content, likes, likedBy, responses } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    try {
      const docRef = doc(db, 'posts', id);
      await updateDoc(docRef, { content, likes, likedBy, responses });
      res.status(200).json({ id, content, likes, likedBy, responses });
    } catch (error) {
      console.error('Error updating document: ', error);
      res.status(500).json({ error: 'Failed to update post' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const docRef = doc(db, 'posts', id);
      await deleteDoc(docRef);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting document: ', error);
      res.status(500).json({ error: 'Failed to delete post' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
