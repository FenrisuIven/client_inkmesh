'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { useEditorSync } from '../../../hooks/useEditorSync';
import { useParams } from 'next/navigation';

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
  const params = useParams();
  const docId = params.docId as string;
  const { content, handleContentChange, isReady, sessionId } = useEditorSync(docId);

  return (
    <div className="flex flex-col w-full h-full p-8 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Document Editor</h1>
          <p className="text-sm text-gray-500">{isReady ? 'Connected' : 'Initializing...'}</p>
        </div>
        {sessionId && (
          <div className="text-xs bg-muted px-2 py-1 rounded">
            Session: <span className="font-mono">{sessionId.slice(0, 8)}</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 border rounded-lg shadow-sm bg-background">
        {isReady ? (
          <Editor value={content} onChange={handleContentChange} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full border-2 border-dashed rounded-lg">
            <p className="animate-pulse">Connecting to writing session...</p>
          </div>
        )}
      </div>
    </div>
  );
}
