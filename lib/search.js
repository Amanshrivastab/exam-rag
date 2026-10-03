const { embed } = require("./embed");

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// notes ke chunks ka index banao (ek baar)
async function buildIndex(chunks) {
  const index = [];
  for (let i = 0; i < chunks.length; i++) {
    const vector = await embed(chunks[i]);
    index.push({ id: i, text: chunks[i], vector });
  }
  return index;
}

// ek query ke liye top-K chunks
async function searchTopK(query, index, k = 3) {
  const qv = await embed(query);
  return index
    .map((c) => ({ id: c.id, text: c.text, score: cosine(qv, c.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

module.exports = { buildIndex, searchTopK };