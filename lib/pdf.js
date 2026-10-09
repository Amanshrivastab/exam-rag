const fs = require("fs");
const pdf = require("pdf-parse/lib/pdf-parse.js");
const path = require("path");

const MIN_CHARS_PER_PAGE = 100; // isse kam text = scanned maan lo
const MAX_OCR_PAGES = 30;       // demo me time control ke liye

async function ocrPdf(filePath) {
  const { pdf: toImages } = await import("pdf-to-img"); // ESM package hai
  const { createWorker,PSM } = require("tesseract.js");

 const worker = await createWorker("eng", 1, {
  langPath: path.join(__dirname, "..", "tessdata"), // exam-rag/tessdata
   cachePath: path.join(__dirname, "..", "tessdata"),
  gzip: false, // file uncompressed hai
});
await worker.setParameters({tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
  user_defined_dpi: "300",});
  const doc = await toImages(filePath, { scale: 2 }); // scale 2 = clear image, better OCR

  let text = "";
  let page = 0;
  for await (const image of doc) {
    if (++page > MAX_OCR_PAGES) break;
    console.log(`OCR: page ${page}`);
    const { data } = await worker.recognize(image);
    text += data.text + "\n";
  }
  await worker.terminate();
  return text;
}

async function extractText(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer);

  const perPage = data.text.trim().length / Math.max(data.numpages, 1);
  if (perPage >= MIN_CHARS_PER_PAGE) return data.text; // normal PDF

  console.log("Scanned PDF detect hua, OCR chal raha hai...");
  return ocrPdf(filePath);
}

module.exports = { extractText };