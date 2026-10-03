const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const { extractText } = require("./lib/pdf");
const { chunkText } = require("./lib/chunk");
const { extractQuestions } = require("./lib/pyq");
const { buildIndex, searchTopK } = require("./lib/search");
const { identifyTopic } = require("./lib/llm");
const { buildReport } = require("./lib/topics");

const app = express();
const upload = multer({ dest: "uploads/" });
const indexCache = new Map();

app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (req, res) => res.json({ ok: true }));

app.post(
  "/analyze",
  upload.fields([
    { name: "notes", maxCount: 1 },
    { name: "pyq", maxCount: 5 },
  ]),
  async (req, res) => {
    const notesFile = req.files?.notes?.[0];
    const pyqFiles = req.files?.pyq || [];
    const allFiles = [notesFile, ...pyqFiles].filter(Boolean);

    try {
      if (!notesFile || pyqFiles.length === 0) {
        return res
          .status(400)
          .json({ error: "Notes aur kam se kam 1 PYQ PDF chahiye" });
      }

      // 1. notes -> chunks -> index (cache ke saath)
      const hash = crypto
        .createHash("md5")
        .update(fs.readFileSync(notesFile.path))
        .digest("hex");

      let entry = indexCache.get(hash);
      if (!entry) {
        console.time("index");
        const chunks = chunkText(await extractText(notesFile.path));
        if (chunks.length === 0) {
          return res
            .status(400)
            .json({ error: "Notes se text nahi nikla (scanned PDF?)" });
        }
        entry = { chunks, index: await buildIndex(chunks) };
        indexCache.set(hash, entry);
        console.timeEnd("index");
      } else {
        console.log("index: cache hit");
      }
      const { chunks, index } = entry;

      // 2. saare PYQ files ke questions
      const questions = [];
      for (const f of pyqFiles) {
        const qs = extractQuestions(await extractText(f.path));
        questions.push(...qs.map((q) => ({ ...q, source: f.originalname })));
      }
      if (questions.length === 0) {
        return res.status(400).json({ error: "PYQ me questions nahi mile" });
      }

      // 3. har question: search + topic
      console.time("topics");
      const results = [];
      for (const q of questions) {
        const top = await searchTopK(q.text, index, 3);
        const info = await identifyTopic(q.text, top.map((t) => t.text));
        results.push({
          number: q.number,
          source: q.source,
          question: q.text.slice(0, 120),
          topic: info.topic,
          chunkIds: top.map((t) => t.id),
        });
      }
      console.timeEnd("topics");

      // 4. report
      const report = buildReport(results);
      report.chunks = report.chunks.map((c) => ({
        ...c,
        preview: chunks[c.id].slice(0, 200) + "...",
      }));

      res.json({ ...report, questions: results });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Analyze fail hua: " + err.message });
    } finally {
      allFiles.forEach((f) => fs.unlink(f.path, () => {}));
    }
  }
);

app.listen(3000, () => console.log("Server: http://localhost:3000"));