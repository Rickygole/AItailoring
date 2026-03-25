import React from 'react';

export default function DiffEditor({ original, rewritten, onAccept, diffKeywords = [] }) {
  // Highlight injected keywords in rewritten text
  let highlighted = rewritten;
  diffKeywords.forEach(kw => {
    if (kw && kw.trim()) {
      const re = new RegExp(`(\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b)`, 'gi');
      highlighted = highlighted.replace(re, '<span class="bg-green-700/40 text-green-300 font-semibold px-1 rounded">$1</span>');
    }
  });

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full items-start">
      <div className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl p-4 min-h-[80px]">
        <span className="line-through text-red-400/60 select-text">{original}</span>
      </div>
      <div className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl p-4 min-h-[80px]">
        <span dangerouslySetInnerHTML={{ __html: highlighted }} />
      </div>
      <button
        className="bg-accent hover:bg-accent/80 text-white font-semibold px-6 py-2 rounded-xl shadow transition"
        onClick={onAccept}
      >
        Accept
      </button>
    </div>
  );
}
