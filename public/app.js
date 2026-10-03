const $ = (id) => document.getElementById(id);
let timer;

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text; // textContent = safe, HTML inject nahi hoga
  return e;
}

function setStatus(msg, isError = false) {
  $("status").textContent = msg;
  $("status").className = "status" + (isError ? " error" : "");
}

$("go").addEventListener("click", async () => {
  const notes = $("notes").files[0];
  const pyqs = [...$("pyq").files];

  if (!notes || pyqs.length === 0) {
    return setStatus("Notes and at least one PYQ PDF required.", true);
  }

  const fd = new FormData();
  fd.append("notes", notes);
  pyqs.forEach((f) => fd.append("pyq", f));

  $("go").disabled = true;
  $("results").hidden = true;

  const start = Date.now();
  timer = setInterval(() => {
    const s = Math.floor((Date.now() - start) / 1000);
    setStatus(`Analyzing... ${s}s (local AI, takes a moment)`);
  }, 1000);

  try {
    const res = await fetch("/analyze", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong");
    render(data);
    setStatus(`Done ✅ (${Math.floor((Date.now() - start) / 1000)}s)`);
  } catch (err) {
    setStatus(err.message, true);
  } finally {
    clearInterval(timer);
    $("go").disabled = false;
  }
});

function render(data) {
  // topics
  const topics = $("topics");
  topics.replaceChildren();
  data.topics.forEach((t) => {
    const card = el("div", "item");
    card.append(el("strong", "", t.topic));
    card.append(el("span", "badge", `${t.count}x`));
    card.append(el("small", "", "Q: " + t.questions.join(", ")));
    topics.append(card);
  });

  // chunks
  const chunks = $("chunks");
  chunks.replaceChildren();
  data.chunks.slice(0, 5).forEach((c, i) => {
    const card = el("div", "item");
    card.append(el("strong", "", `#${i + 1} (chunk ${c.id})`));
    card.append(el("span", "badge", `${c.hits} questions`));
    card.append(el("p", "", c.preview));
    chunks.append(card);
  });

  // questions
  const qs = $("questions");
  qs.replaceChildren();
  data.questions.forEach((q) => {
    const card = el("div", "item");
    card.append(el("strong", "", `Q${q.number} → ${q.topic}`));
    card.append(el("small", "", q.source));
    card.append(el("p", "", q.question + "..."));
    qs.append(card);
  });

  $("results").hidden = false;
}