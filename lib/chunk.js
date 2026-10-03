function chunkText(text, size = 400, overlap = 50) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const chunks = [];

  for (let i = 0; i < words.length; i += size - overlap) {
    const piece = words.slice(i, i + size).join(" ");
    if (piece.length > 50) chunks.push(piece);
  }
  return chunks;
}

module.exports = { chunkText };