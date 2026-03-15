const fetch = require('node-fetch');

async function test() {
    try {
        const res = await fetch("https://us-central1-lifemap-72b21.cloudfunctions.net/fiinnyBrainQuery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: "Hello", userPhone: "+919999999999" })
        });

        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Body:", text);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
