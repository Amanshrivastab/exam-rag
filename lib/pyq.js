const DIGIT = { l: "1", I: "1", O: "0", o: "0" };
const toNum = (s) => Number(s.replace(/[lIOo]/g, (c) => DIGIT[c]));

function cleanNoise(t) {
  return t
    .replace(/\[\s*[\d.]+\s*(?:Marks?)?\s*\]/gi, " ")   // [10] ya [10 Marks]
    .replace(/^.*Page\s+\d+\s+of\s+\d+.*$/gim, " ")
    .replace(/\[\s*END OF EXAMINATION PAPER\s*\]/gi, " ")
    .replace(/SECTION\s+[A-Z]\s*:[^\n]*/gi, " ")
    .replace(/^.*(?:DIGITAL ELECTRONICS|B\.?Tech|Time\s*:|Max\.?\s*Marks|Note\s*:).*$/gim, " ") // header lines
    .split("\n")
    .filter((l) => !l.trim() || /[A-Za-z]{3,}/.test(l))  // OCR kachra lines (ee, LEE) hatao
    .join("\n");
}

function extractQuestions(rawText) {
  // paper ko saal ke header se todo (2023, 2024 ...)
  const parts = rawText.split(/(?=(?:END SEMESTER\s+)?EXAMINATION\s*[-–—]\s*\d{4})/i);
  const out = [];
  for (const part of parts) {
    const year = (part.match(/EXAMINATION\s*[-–—]\s*(\d{4})/i) || [])[1] || null;
    const text = cleanNoise(part);

    // "Q.1 Text", "Q1.", "Question 2:", "Q.4_ Text" sab chalega
    const re = /(?:^|\n)\s*(?:Question|Ques|Q)\s*\.?\s*([0-9lIO]{1,2})\s*[:.)\-_]?\s*(?=[A-Za-z(])/gi;
    const marks = [...text.matchAll(re)];

    marks.forEach((m, i) => {
      const start = m.index + m[0].length;
      const end = i + 1 < marks.length ? marks[i + 1].index : text.length;
      const body = text.slice(start, end).replace(/\s+/g, " ").trim();
      if (body.length > 20) out.push({ year, number: toNum(m[1]), text: body });
    });
  }
  return out;
}

module.exports = { extractQuestions };