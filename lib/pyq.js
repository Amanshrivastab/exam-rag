function extractQuestions(rawText) {
  // 1. kachra saaf
  const text = rawText
    .replace(/\[\s*[\d.]+\s*Marks?\s*\]/gi, " ")
    .replace(/^.*Page\s+\d+\s+of\s+\d+.*$/gim, " ")
    .replace(/\[\s*END OF EXAMINATION PAPER\s*\]/gi, " ")
    .replace(/SECTION\s+[A-Z]\s*:[^\n]*/gi, " ");

  // 2. "Question 1:" / "Q1." / "Q.2)" jaise patterns dhoondo
  const re = /(?:^|\n)\s*(?:Question|Q|Ques)\.?\s*([0-9lIO]{1,2})\s*[:.)\-]/gi;
  const marks = [...text.matchAll(re)];

  // 3. do markers ke beech ka text = ek question
  return marks
    .map((m, i) => {
      const start = m.index + m[0].length;
      const end = i + 1 < marks.length ? marks[i + 1].index : text.length;
      const body = text.slice(start, end).replace(/\s+/g, " ").trim();
      return { number: Number(m[1]), text: body };
    })
    .filter((q) => q.text.length > 20);
}

module.exports = { extractQuestions };