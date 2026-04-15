'use client';

import {
  useEffect, useState
} from "react";

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

function Editor() {
  const [value, setValue] = useState('');
  return <ReactQuill
    theme="snow"
    value={value}
    onChange={setValue}
    style={{
      width: '100%',
      height: '100%'
    }}
    modules={{
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        ['blockquote', 'code-block'],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'font': [] }],
        [{ 'align': [] }],
      ]
    }}
  />;
}

export default function Home() {
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    // Simulate loading time for the editor
    const timer = setTimeout(() => {
      setShowEditor(true);
    }, 1000); // Adjust the delay as needed

    return () => clearTimeout(timer);
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-screen font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center w-full h-9/10 px-16 sm:items-start">
        <h1 className="text-4xl font-bold">InkMesh</h1>
        <p className="text-lg">Welcome to your new project.</p>
        {showEditor ? <Editor /> : <p>Loading editor...</p>}
      </main>
    </div>
  );
}
