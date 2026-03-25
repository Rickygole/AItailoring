// src/worker.js
importScripts('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.15.0/dist/transformers.min.js');

let featureExtractor = null;
let text2textGenerator = null;

async function loadModels() {
  if (!featureExtractor) {
    featureExtractor = await window.transformers.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  if (!text2textGenerator) {
    text2textGenerator = await window.transformers.pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-783M');
  }
}

self.onmessage = async (e) => {
  const { task, payload } = e.data;
  await loadModels();

  if (task === 'extract-features') {
    // ATS Score: Cosine similarity between resume and JD
    const { resumeText, jdText } = payload;
    const [resumeVec] = await featureExtractor(resumeText);
    const [jdVec] = await featureExtractor(jdText);
    const score = cosineSimilarity(resumeVec, jdVec);
    self.postMessage({ task, result: score });
  } else if (task === 'rewrite-bullet') {
    // Rewrite bullet to include missing keywords
    const { bullet, jdKeywords } = payload;
    const prompt = `Rewrite this resume bullet to include these keywords if relevant: ${jdKeywords.join(', ')}. Bullet: ${bullet}`;
    const output = await text2textGenerator(prompt, { max_new_tokens: 60 });
    self.postMessage({ task, result: output[0].generated_text });
  }
};

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
