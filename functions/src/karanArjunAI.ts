import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as https from "https";

// Store OpenAI key as a Firebase Secret (never exposed to client)
const openAiKey = defineSecret("OPENAI_API_KEY");

/**
 * KaranArjun AI Business Advisor
 * Proxies OpenAI gpt-4o-mini with business context.
 * Key lives in Firebase Secrets — never exposed to browser.
 */
export const karanArjunAIChat = onRequest(
  {
    cors: true,
    secrets: [openAiKey],
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const { messages, businessContext } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "messages array required" });
      return;
    }

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
        ...messages.slice(-10), // last 10 messages for context
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
      res.status(response.status).json({ error: "OpenAI error", raw: response.data });
      return;
    }

    const parsed = JSON.parse(response.data);
    const reply = parsed.choices?.[0]?.message?.content || "No response";
    res.json({ reply });
  }
);
