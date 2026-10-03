const { extractText } = require("./lib/pdf");
const { chunkText } = require("./lib/chunk");
const { extractQuestions } = require("./lib/pyq");
const { buildIndex, searchTopK } = require("./lib/search");
const { identifyTopic } = require("./lib/llm");
const { buildReport } = require("./lib/topics");

(async () => {
  const chunks = chunkText(await extractText("uploads/test.pdf"));
  const questions = extractQuestions(await extractText("uploads/pyq.pdf"));
  const index = await buildIndex(chunks);

  const results = [];
  for (const q of questions) {
    const top = await searchTopK(q.text, index, 3);
    const info = await identifyTopic(q.text, top.map((t) => t.text));
    results.push({
      number: q.number,
      topic: info.topic,
      chunkIds: top.map((t) => t.id),
    });
    console.log(`Q${q.number} -> ${info.topic}`);
  }

  console.log("\n=== REPORT ===");
  console.log(JSON.stringify(buildReport(results), null, 2));
})();