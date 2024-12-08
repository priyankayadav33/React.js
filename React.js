// File: src/App.js

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Components
function Home({ blogs, handleDelete }) {
  return (
    <div>
      <h1>TypeIT - Blogs</h1>
      <Link to="/create">Create New Blog</Link>
      {blogs.map((blog) => (
        <div key={blog.id} style={{ border: "1px solid black", padding: "10px", margin: "10px" }}>
          <h2>{blog.title}</h2>
          <p>{blog.content}</p>
          <button onClick={() => handleDelete(blog.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

function CreateBlog({ addBlog }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addBlog({ title, content });
    setTitle("");
    setContent("");
  };

  return (
    <div>
      <h1>Create a New Blog</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>
        <button type="submit">Create Blog</button>
      </form>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    const blogCollection = collection(db, "blogs");
    const blogSnapshot = await getDocs(blogCollection);
    setBlogs(blogSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const addBlog = async (blog) => {
    const blogRef = collection(db, "blogs");
    await addDoc(blogRef, blog);
    fetchBlogs();
  };

  const handleDelete = async (id) => {
    const blogDoc = doc(db, "blogs", id);
    await deleteDoc(blogDoc);
    fetchBlogs();
  };

  return (
    <Router>
      <div>
        <header>
          <h1>Welcome to TypeIT</h1>
          {user ? (
            <div>
              <p>Hello, {user.displayName}</p>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <button onClick={handleLogin}>Login with Google</button>
          )}
        </header>

        <Routes>
          <Route path="/" element={<Home blogs={blogs} handleDelete={handleDelete} />} />
          <Route path="/create" element={<CreateBlog addBlog={addBlog} />} />
        </Routes>
      </div>
    </Router>
  );
}
