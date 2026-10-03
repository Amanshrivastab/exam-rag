const express = require("express");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(3000, () => console.log("Server: http://localhost:3000"));