function buildReport(results) {
  const topicMap = {};
  const chunkHits = {};

  for (const r of results) {
    const key = r.topic.trim().toLowerCase();
    if (!topicMap[key]) topicMap[key] = { topic: r.topic, count: 0, questions: [] };
    topicMap[key].count++;
    topicMap[key].questions.push(r.number);

    for (const id of r.chunkIds) chunkHits[id] = (chunkHits[id] || 0) + 1;
  }

  return {
    topics: Object.values(topicMap).sort((a, b) => b.count - a.count),
    chunks: Object.entries(chunkHits)
      .map(([id, hits]) => ({ id: Number(id), hits }))
      .sort((a, b) => b.hits - a.hits),
  };
}

module.exports = { buildReport };