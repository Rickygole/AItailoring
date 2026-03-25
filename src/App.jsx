
import React, { useState, useRef } from 'react';
import Dropzone from './components/Dropzone';
import AtsScore from './components/AtsScore';
import DiffEditor from './components/DiffEditor';
import { extractPdfText } from './lib/pdfParser';

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [atsScore, setAtsScore] = useState(null);
  const [bullets, setBullets] = useState([]); // [{ original, rewritten, accepted, diffKeywords }]
  const [loading, setLoading] = useState(false);
  const [workerReady, setWorkerReady] = useState(false);
  const workerRef = useRef(null);

  // Initialize worker
  React.useEffect(() => {
    workerRef.current = new Worker(new URL('./worker.js', import.meta.url));
    workerRef.current.onmessage = (e) => {
      const { task, result } = e.data;
      if (task === 'extract-features') {
        setAtsScore(result);
      } else if (task === 'rewrite-bullet') {
        setBullets(bullets => {
          const idx = bullets.findIndex(b => !b.rewritten && !b.accepted);
          if (idx === -1) return bullets;
          const diffKeywords = getDiffKeywords(bullets[idx].original, result);
          const updated = [...bullets];
          updated[idx] = { ...updated[idx], rewritten: result, diffKeywords };
          return updated;
        });
      }
    };
    setWorkerReady(true);
    return () => workerRef.current.terminate();
  }, []);

  // Helper: extract bullet points (simple split by line or dot)
  function extractBullets(text) {
    return text.split(/\n|\r|•|\u2022|\./).map(s => s.trim()).filter(Boolean);
  }

  // Helper: find injected keywords
  function getDiffKeywords(original, rewritten) {
    const origWords = new Set(original.toLowerCase().split(/\W+/));
    return rewritten.split(/\W+/).filter(w => w && !origWords.has(w.toLowerCase()));
  }

  // Handle PDF upload
  async function handleFile(file) {
    setResumeFile(file);
    setLoading(true);
    const text = await extractPdfText(file);
    setResumeText(text);
    setBullets(extractBullets(text).map(b => ({ original: b, rewritten: '', accepted: false, diffKeywords: [] })));
    setLoading(false);
  }

  // Calculate ATS score
  async function handleScore() {
    if (!resumeText || !jdText) return;
    setLoading(true);
    workerRef.current.postMessage({ task: 'extract-features', payload: { resumeText, jdText } });
    setLoading(false);
  }

  // Rewrite a bullet
  async function handleRewrite(idx) {
    const bullet = bullets[idx];
    if (!bullet || bullet.accepted) return;
    const jdKeywords = jdText.split(/\W+/).filter(Boolean);
    workerRef.current.postMessage({ task: 'rewrite-bullet', payload: { bullet: bullet.original, jdKeywords } });
  }

  // Accept rewritten bullet
  function handleAccept(idx) {
    setBullets(bullets => {
      const updated = [...bullets];
      updated[idx].accepted = true;
      return updated;
    });
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-accent drop-shadow">AutoTailor</h1>
      <Dropzone onFile={handleFile} jdText={jdText} setJdText={setJdText} />
      <div className="mt-8 w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
        <button
          className="bg-accent hover:bg-accent/80 text-white font-semibold px-6 py-2 rounded-xl shadow transition mb-4"
          onClick={handleScore}
          disabled={!resumeText || !jdText || loading}
        >
          Calculate ATS Score
        </button>
        {atsScore !== null && <AtsScore score={atsScore} />}
        {bullets.length > 0 && (
          <div className="w-full flex flex-col gap-8 mt-8">
            <h2 className="text-xl font-semibold mb-2 text-zinc-300">Resume Bullets</h2>
            {bullets.map((b, i) => (
              <div key={i} className="mb-4">
                <DiffEditor
                  original={b.original}
                  rewritten={b.rewritten}
                  diffKeywords={b.diffKeywords}
                  onAccept={() => handleAccept(i)}
                />
                {!b.rewritten && !b.accepted && (
                  <button
                    className="mt-2 bg-zinc-800 hover:bg-accent/80 text-accent hover:text-white font-semibold px-4 py-1 rounded transition"
                    onClick={() => handleRewrite(i)}
                  >
                    Rewrite with AI
                  </button>
                )}
                {b.accepted && <span className="ml-4 text-green-400 font-semibold">Accepted</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App
