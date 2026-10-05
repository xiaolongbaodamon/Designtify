import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { CanvasDesign, CanvasComment } from '../types/design';

/**
 * Save or update a design in Firestore
 */
export async function saveDesignToFirestore(design: CanvasDesign, isAutoSave: boolean = false) {
  const user = auth.currentUser;
  const path = `projects/${design.id}`;
  try {
    const dataToSave = {
      id: design.id,
      title: design.title,
      presetId: design.presetId,
      width: design.width,
      height: design.height,
      background: design.background,
      elements: design.elements,
      updatedAt: serverTimestamp(),
      ownerId: user ? user.uid : 'guest',
      ownerName: user?.displayName || 'Creative Designer',
      isPublic: true,
    };

    await setDoc(doc(db, 'projects', design.id), dataToSave, { merge: true });
    return true;
  } catch (error) {
    if (!isAutoSave) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } else {
      console.warn('Auto-save to Firestore deferred:', error);
    }
    return false;
  }
}

/**
 * Subscribe in real-time to a project document in Firestore
 */
export function subscribeToProject(
  projectId: string,
  onUpdate: (design: CanvasDesign) => void,
  onError?: (err: any) => void
) {
  const path = `projects/${projectId}`;
  const docRef = doc(db, 'projects', projectId);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onUpdate({
          id: data.id || projectId,
          title: data.title || 'Untitled Design',
          presetId: data.presetId || 'instagram-square',
          width: data.width || 1080,
          height: data.height || 1080,
          background: data.background || { type: 'solid', color: '#0f172a' },
          elements: data.elements || [],
          updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : Date.now(),
        });
      }
    },
    (error) => {
      console.warn('Firestore project subscription error:', error);
      onError?.(error);
    }
  );
}

/**
 * Save a comment pin to Firestore
 */
export async function saveCommentToFirestore(projectId: string, comment: CanvasComment) {
  const path = `projects/${projectId}/comments/${comment.id}`;
  try {
    await setDoc(doc(db, 'projects', projectId, 'comments', comment.id), {
      ...comment,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Subscribe to comments in a project in Firestore
 */
export function subscribeToComments(
  projectId: string,
  onCommentsUpdate: (comments: CanvasComment[]) => void
) {
  const colRef = collection(db, 'projects', projectId, 'comments');
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: CanvasComment[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: d.id || docSnap.id,
          x: d.x,
          y: d.y,
          author: d.author,
          text: d.text,
          createdAt: d.createdAt?.toMillis ? d.createdAt.toMillis() : Date.now(),
          resolved: d.resolved || false,
        });
      });
      onCommentsUpdate(list);
    },
    (err) => {
      console.warn('Comments subscription warning:', err);
    }
  );
}
