import React, { useRef } from 'react';
import { UploadCloud } from 'lucide-react';

export default function Dropzone({ onFile, jdText, setJdText }) {
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full">
      <div
        className="flex-1 bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition hover:border-accent/80 hover:bg-zinc-800 min-h-[220px]"
        onClick={() => inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        <UploadCloud className="w-12 h-12 text-accent mb-4" />
        <p className="text-zinc-300 mb-2">Drag & drop your resume PDF here</p>
        <p className="text-zinc-500 text-xs">or click to select</p>
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          ref={inputRef}
          onChange={e => onFile(e.target.files[0])}
        />
      </div>
      <textarea
        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-zinc-200 min-h-[220px] resize-none focus:outline-none focus:border-accent/80 transition"
        placeholder="Paste the Job Description here..."
        value={jdText}
        onChange={e => setJdText(e.target.value)}
      />
    </div>
  );
}
