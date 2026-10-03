# 📚 Exam Topic Finder

A local, privacy-first RAG app that compares your **study notes** with **previous year question papers (PYQs)** and tells you which topics matter most for the exam.

No API keys. No cloud. Everything runs on your own machine using [Ollama](https://ollama.com).

![Home screen](docs/home.png)

## Why this exists

Students usually have two things: a pile of notes and a few old question papers. Matching them by hand is slow. This app does it automatically:

1. Reads your notes and your PYQs
2. Finds which parts of the notes each question is actually about
3. Ranks topics by how often they are asked

Upload multiple years of PYQs and the frequency count shows which topics keep coming back.

## How it works (RAG pipeline)

```
Notes PDF ──► text ──► chunks ──► embeddings (nomic-embed-text) ──► in-memory index
                                                                          │
PYQ PDFs ──► text ──► individual questions ──► embeddings ──► cosine similarity
                                                                          │
                                                       top-3 matching note chunks
                                                                          │
                                                  llama3.2 names the topic of each question
                                                                          │
                                              topics ranked by frequency + most-hit notes
```

- **Retrieval:** notes are split into overlapping chunks, embedded, and matched to each question using cosine similarity.
- **Generation:** a small local LLM (llama3.2) reads the question plus its best-matching note and returns a short topic name.
- **Report:** topics are grouped and counted, and the note chunks that match the most questions are listed as high-priority reading.

## Tech stack

- Node.js + Express
- Multer (file upload) and pdf-parse (text extraction)
- Ollama with `llama3.2` (topic naming) and `nomic-embed-text` (embeddings)
- Plain HTML, CSS and JavaScript frontend

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 18 or newer
- [Ollama](https://ollama.com) installed and running

### Setup

```bash
# 1. Pull the models
ollama pull llama3.2
ollama pull nomic-embed-text

# 2. Clone and install
git clone https://github.com/Amanshrivastab/exam-rag.git
cd exam-rag
npm install

# 3. Run
npm start
```

Open http://localhost:3000, upload your notes and one or more PYQ PDFs, and click **Analyze**.

## Project structure

```
exam-rag/
├── server.js        # Express app and /analyze route
├── lib/
│   ├── pdf.js       # PDF to text
│   ├── chunk.js     # overlapping text chunking
│   ├── pyq.js       # question extraction (regex)
│   ├── embed.js     # Ollama embedding call
│   ├── search.js    # cosine similarity and top-K search
│   ├── llm.js       # Ollama generation and topic prompt
│   └── topics.js    # grouping and counting
└── public/          # single-page UI
```

## API

`POST /analyze` (multipart form data)

| Field   | Type          | Description                    |
| ------- | ------------- | ------------------------------ |
| `notes` | PDF, 1 file   | Your study notes               |
| `pyq`   | PDF, up to 5  | One or more question papers    |

Returns JSON with `topics` (ranked), `chunks` (most relevant note sections) and `questions` (per-question mapping).

## Known limitations

- Works with **text-based PDFs** only. Scanned or image PDFs need OCR, which is not included yet.
- Question detection expects headings like `Question 1:`, `Q1.` or `Q.2)`. Other paper formats may need a regex tweak in `lib/pyq.js`.
- The index lives in memory and resets when the server restarts.
- Topic names come from a small local model, so they can occasionally be rough.

## Roadmap

- [ ] OCR support for scanned notes and papers
- [ ] More PYQ formats (numbered lists, sub-parts)
- [ ] Persistent vector store
- [ ] Export the report as PDF
- [ ] Smaller chunks for sharper matching

## Contributing

Contributions are welcome, especially for the roadmap items above.

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes and open a pull request

## License

Released under the [MIT License](LICENSE).