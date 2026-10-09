const { OLLAMA } = require("./config");

async function generate(prompt, { json = false, maxTokens = 60 } = {}) {
  const res = await fetch(`${OLLAMA}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2",
      prompt,
      stream: false,
      keep_alive: "30m", // model baar-baar load nahi hoga
      options: { temperature: 0, num_predict: maxTokens, num_ctx: 2048 },
      ...(json && { format: "json" }),
    }),
  });
  const data = await res.json();
  return data.response;
}

async function identifyTopic(question, chunks) {
  const context = (chunks[0] || "").slice(0, 500); // sirf top-1 chunk, chhota
  const q = question.slice(0, 400);

  const prompt = `Exam question: ${q}

Related note: ${context}

Reply ONLY with JSON: {"topic": "2-5 word topic name"}`;

  const raw = await generate(prompt, { json: true });
  try {
    return { topic: JSON.parse(raw).topic || "Unknown" };
  } catch {
    return { topic: "Unknown" };
  }
}

module.exports = { generate, identifyTopic };