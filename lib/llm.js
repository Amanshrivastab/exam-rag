const OLLAMA = "http://localhost:11434";

async function generate (prompt){
    const res = await fetch(`${OLLAMA}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({model:"llama3.2",prompt,stream:false}),
    });
    const data = await res.json();
    return data.response;
}

module.exports = {generate};