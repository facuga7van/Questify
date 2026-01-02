import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  increment,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";

import { db } from "./firebase";
import type { Task } from "./Interfaces/taskTypes";

function userDocRef(uid: string) {
  return doc(collection(db, "questify"), uid);
}

function tasksCollectionRef(uid: string) {
  return collection(db, "questify", uid, "tasks");
}

function taskClassesCollectionRef(uid: string) {
  return collection(db, "questify", uid, "taskClasses");
}

export type UserDoc = {
  currentXp?: number;
  UserName?: string;
  Email?: string;
  characterData?: any;
  [key: string]: any;
};

export function subscribeUserDoc(uid: string, cb: (data: UserDoc | null) => void): Unsubscribe {
  return onSnapshot(
    userDocRef(uid),
    (snap) => cb(snap.exists() ? (snap.data() as UserDoc) : null),
    (error) => {
      console.error("Firestore subscribeUserDoc error:", error);
      cb(null);
    }
  );
}

export async function upsertUserProfile(uid: string, data: { UserName?: string; Email?: string }) {
  await setDoc(
    userDocRef(uid),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function initializeUserDoc(uid: string, data: { UserName: string; Email: string }) {
  // Para signup: crea/mergea datos base. currentXp queda inicializado si no existe.
  await setDoc(
    userDocRef(uid),
    { currentXp: 1, ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function incrementUserXp(uid: string, delta: number) {
  // increment es atómico y crea el campo si no existe
  await setDoc(userDocRef(uid), { currentXp: increment(delta) }, { merge: true });
}

export async function setCharacterData(uid: string, characterData: any) {
  await setDoc(userDocRef(uid), { characterData, updatedAt: serverTimestamp() }, { merge: true });
}

export function subscribeTasks(uid: string, cb: (tasks: Task[]) => void): Unsubscribe {
  const q = query(tasksCollectionRef(uid), orderBy("TaskOrder", "asc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Task[];
      cb(tasks);
    },
    (error) => {
      console.error("Firestore subscribeTasks error:", error);
      cb([]);
    }
  );
}

export async function upsertTask(uid: string, task: Partial<Task> & { id?: string }) {
  const payload = {
    TaskName: task.TaskName ?? "",
    TaskDesc: task.TaskDesc ?? "",
    TaskDiff: task.TaskDiff ?? 0,
    TaskStatus: task.TaskStatus ?? false,
    TaskClass: task.TaskClass ?? "",
    TaskDueDate: task.TaskDueDate ?? null,
    TaskOrder: task.TaskOrder ?? 0,
    TaskUser: uid,
    updatedAt: serverTimestamp(),
    // si no existía, esto queda como createdAt también (merge=true)
    TaskDate: serverTimestamp(),
  };

  if (task.id) {
    await setDoc(doc(tasksCollectionRef(uid), task.id), payload, { merge: true });
  } else {
    await addDoc(tasksCollectionRef(uid), payload);
  }

  if (payload.TaskClass) {
    await ensureTaskClass(uid, payload.TaskClass);
  }
}

export async function deleteTasks(uid: string, ids: string[]) {
  await Promise.all(ids.map((id) => deleteDoc(doc(tasksCollectionRef(uid), id))));
}

export async function setTaskStatus(uid: string, taskId: string, status: boolean) {
  await updateDoc(doc(tasksCollectionRef(uid), taskId), { TaskStatus: status, updatedAt: serverTimestamp() });
}

export async function syncTaskOrders(uid: string, tasks: Array<{ id: string; TaskOrder: number }>) {
  const batch = writeBatch(db);
  tasks.forEach((t) => {
    batch.update(doc(tasksCollectionRef(uid), t.id), { TaskOrder: t.TaskOrder });
  });
  await batch.commit();
}

export function subscribeTaskClasses(uid: string, cb: (classes: string[]) => void): Unsubscribe {
  const q = query(taskClassesCollectionRef(uid), orderBy("createdDate", "asc"));
  return onSnapshot(
    q,
    (snapshot) => {
      cb(snapshot.docs.map((d) => d.id));
    },
    (error) => {
      console.error("Firestore subscribeTaskClasses error:", error);
      cb([]);
    }
  );
}

export async function ensureTaskClass(uid: string, className: string) {
  const trimmed = className.trim();
  if (!trimmed) return;

  await setDoc(
    doc(taskClassesCollectionRef(uid), trimmed),
    { className: trimmed, updatedDate: serverTimestamp(), createdDate: serverTimestamp() },
    { merge: true }
  );
}

// Login "Mail o Usuario" (si tus rules lo permiten sin auth; si no, seguí usando IPC)
export async function resolveEmailFromUsername(usernameOrEmail: string): Promise<string | null> {
  const trimmed = (usernameOrEmail ?? "").trim();
  if (!trimmed) return null;
  if (trimmed.includes("@")) return trimmed;

  const usersRef = collection(db, "questify");
  const q = query(usersRef, where("UserName", "==", trimmed), limit(1));
  const snapshot = await getDocs(q);
  const first = snapshot.docs[0];
  if (!first) return null;
  const data = first.data() as any;
  return (data.Email ?? data.email ?? null) as string | null;
}


