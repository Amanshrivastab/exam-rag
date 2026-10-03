const { extractText } = require("./lib/pdf");
const { chunkText } = require("./lib/chunk");
const { extractQuestions } = require("./lib/pyq");
const { buildIndex, searchTopK } = require("./lib/search");

(async () => {
  const notes = await extractText("uploads/test.pdf");
  const pyq = await extractText("uploads/pyq.pdf");

  const chunks = chunkText(notes);
  const questions = extractQuestions(pyq);

  console.log("Index ban raha hai...");
  const index = await buildIndex(chunks);

  for (const q of questions) {
    const top = await searchTopK(q.text, index, 3);
    console.log(`\nQ${q.number}: ${q.text.slice(0, 60)}...`);
    top.forEach((t) =>
      console.log(`  chunk ${t.id} | score ${t.score.toFixed(3)} | ${t.text.slice(0, 70)}...`)
    );
  }
})();