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
  const BATCH = 5;
  for (let i = 0; i < chunks.length; i += BATCH) {
    const slice = chunks.slice(i, i + BATCH);
    const vectors = await Promise.all(slice.map((c) => embed(c)));
    vectors.forEach((vector, j) =>
      index.push({ id: i + j, text: slice[j], vector })
    );
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
async function groupRepeats(questions, threshold = 0.75) {
  const vecs = await Promise.all(questions.map((q) => embed(q.text)));
  const groups = [];
  questions.forEach((q, i) => {
    const g = groups.find(
      (g) =>
        g.members.every((m) => m.year !== q.year) &&         // same paper ke do question merge na ho
        cosine(vecs[g.first], vecs[i]) >= threshold
    );
    if (g) { g.members.push(q); console.log("sim", cosine(vecs[g.first], vecs[i]).toFixed(2), g.members.map(m => m.year + " Q" + m.number)); }
    else groups.push({ first: i, members: [q] });
  });
  return groups;   // members.length > 1 => repeated
}

module.exports = { buildIndex, searchTopK, groupRepeats };