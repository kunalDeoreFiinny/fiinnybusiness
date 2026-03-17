import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as https from "https";

const openAiKey = defineSecret("OPENAI_API_KEY");

// Production domain — only this origin can call the function
const ALLOWED_ORIGINS = [
  "https://karanarjun-pvt-ltd.web.app",
  "https://karanarjun-pvt-ltd.firebaseapp.com",
  "https://karanarjun.in",
  "https://www.karanarjun.in",
];

// Rate limit: max AI calls per user per day
const MAX_DAILY_CALLS = 50;

export const karanArjunAIChat = onRequest(
  {
    cors: ALLOWED_ORIGINS,
    secrets: [openAiKey],
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const { messages, businessContext, uid } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "messages array required" });
      return;
    }

    // ── Rate limiting ──────────────────────────────────────────
    if (uid) {
      const db = getFirestore();
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const usageRef = db.doc(`aiUsage/${uid}/daily/${today}`);

      const snap = await usageRef.get();
      const currentCount: number = snap.exists ? (snap.data()?.calls || 0) : 0;

      if (currentCount >= MAX_DAILY_CALLS) {
        res.status(429).json({
          error: `Daily AI limit reached (${MAX_DAILY_CALLS} calls/day). Try again tomorrow.`,
        });
        return;
      }

      // Increment counter (create if first call today)
      await usageRef.set(
        { calls: FieldValue.increment(1), uid, date: today },
        { merge: true }
      );
    }

    // ── OpenAI Call ────────────────────────────────────────────
    const apiKey = openAiKey.value();
    if (!apiKey) {
      res.status(500).json({ error: "AI service not configured" });
      return;
    }

    const systemPrompt = `You are an expert Indian business advisor for KaranArjun SaaS, a B2B retailer management platform.
You speak helpfully and concisely using Indian business terminology.

${businessContext || "No business context provided."}

Answer questions based on this live data. Be specific with numbers. Use ₹ for currency. Keep responses under 300 words. Use markdown formatting (bold, bullets). Always end with one actionable tip.`;

    const body = JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-10),
      ],
      temperature: 0.5,
      max_tokens: 512,
    });

    const options = {
      hostname: "api.openai.com",
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const response = await new Promise<{ status: number; data: string }>(
      (resolve, reject) => {
        const reqOut = https.request(options, (resIn) => {
          let data = "";
          resIn.on("data", (chunk) => (data += chunk));
          resIn.on("end", () =>
            resolve({ status: resIn.statusCode || 500, data })
          );
        });
        reqOut.on("error", reject);
        reqOut.write(body);
        reqOut.end();
      }
    );

    if (response.status !== 200) {
      res.status(response.status).json({ error: "OpenAI error" });
      return;
    }

    const parsed = JSON.parse(response.data);
    const reply = parsed.choices?.[0]?.message?.content || "No response";
    res.json({ reply, callsRemaining: uid ? MAX_DAILY_CALLS - 1 : null });
  }
);
