'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { useEditorSync } from '../hooks/useEditorSync';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

function Editor({ value, onChange }: { value: string; onChange: (content: string) => void }) {
  return (
    <div className="w-full h-full pb-16">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
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
      />
    </div>
  );
}

export default function Home() {
  const { content, handleContentChange, isReady, sessionId } = useEditorSync();

  return (
    <div className="flex flex-col items-center justify-center h-screen font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center w-full h-9/10 px-16 sm:items-start">
        <header className="flex justify-between w-full items-center">
          <div>
            <h1 className="text-4xl font-bold">InkMesh</h1>
            <p className="text-sm text-gray-500">Document Sync Status: {isReady ? 'Active' : 'Initializing...'}</p>
          </div>
          {sessionId && (
            <div className="text-xs bg-gray-100 px-2 py-1 rounded">
              Session: <span className="font-mono">{sessionId.slice(0, 8)}...</span>
            </div>
          )}
        </header>

        {isReady ? (
          <Editor value={content} onChange={handleContentChange} />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg">
            <p className="animate-pulse">Connecting to writing session...</p>
          </div>
        )}
      </main>
    </div>
  );
}
