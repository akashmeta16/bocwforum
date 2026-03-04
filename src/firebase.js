import { initializeApp, getApps } from "firebase/app";
import { getDatabase, get, push, ref } from "firebase/database";
import { formatDate, parseDate } from "./lib/utils";

const firebaseConfig = {
  apiKey: "AIzaSyAGFYOXC6qjkCHoFuh8NfOqf9AdBv3Y9pA",
  authDomain: "bocwforum-260304144119.firebaseapp.com",
  databaseURL: "https://bocwforum-260304144119-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bocwforum-260304144119",
  storageBucket: "bocwforum-260304144119.firebasestorage.app",
  messagingSenderId: "171305984465",
  appId: "1:171305984465:web:14d66c8045803baaa180f0"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getDatabase(app);

function normalizeComment(record) {
  if (!record || typeof record !== "object") return null;

  const name = String(record.name || "").trim();
  const text = String(record.text || "").trim();
  if (!name || !text) return null;

  let createdAt = Number(record.createdAt);
  if (!Number.isFinite(createdAt)) {
    const parsed = parseDate(record.date);
    createdAt = Number.isFinite(parsed) ? parsed : Date.now();
  }

  return {
    name,
    text,
    date: String(record.date || formatDate(createdAt)),
    createdAt
  };
}

export async function loadRemoteTopicDetails() {
  const snapshot = await get(ref(db, "discussion/topicDetails"));
  const remote = snapshot.val() || {};
  const normalized = {};

  Object.keys(remote).forEach((topicId) => {
    const remoteTopic = remote[topicId] || {};
    const commentsMap = remoteTopic.comments || {};

    const comments = Object.keys(commentsMap)
      .map((key) => normalizeComment(commentsMap[key]))
      .filter(Boolean)
      .sort((a, b) => a.createdAt - b.createdAt);

    normalized[String(topicId)] = { comments };
  });

  return normalized;
}

export async function saveDiscussionComment(topicId, comment) {
  await push(ref(db, `discussion/topicDetails/${String(topicId)}/comments`), comment);
}
