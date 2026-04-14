"use client";
/**
 * BLOG SEED PAGE — visit /seed-posts to push all articles to Firestore.
 * INSTRUCTIONS:
 * 1. Make sure you are logged in as an admin first.
 * 2. Navigate to /seed-posts in the browser.
 * 3. Click "Seed All Articles" and wait for "Done".
 * 4. Delete or protect this page after seeding.
 */

import { useState } from "react";
import { BlogService } from "@/lib/blog-service";

const ARTICLES = [
  {
    slug: "best-expense-tracker-india-2025",
    title: "Best Expense Tracker Apps in India 2025 (Ranked & Reviewed)",
    excerpt: "Tired of manually entering every expense? We tested the top personal finance apps in India — here's which one actually saves you time and protects your data.",
    seoTitle: "Best Expense Tracker Apps India 2025 — Fiinny vs Walnut vs Money Manager",
    seoDescription: "Comprehensive review of the best expense tracker apps for India in 2025. Compare Fiinny, Walnut, Money Manager, and more. Includes SMS auto-tracking and privacy analysis.",
    keywords: ["best expense tracker app india 2025", "personal finance app india", "expense manager app android india", "sms expense tracker", "track expenses automatically india"],
    author: "Arjun Tanpure",
    date: "April 10, 2026",
    readTime: "8 min read",
    categories: ["Personal Finance", "App Reviews"],
    published: true,
    content: `<h2>The Problem With Most Expense Trackers in India</h2>
<p>Every app promises to "automatically track your expenses." In reality, most of them require you to manually log each transaction, remember to open the app, or link your bank account — which, in India, rarely works reliably.</p>
<p>We spent 3 months testing the top expense tracker apps available in India and ranked them on four criteria: <strong>automation</strong>, <strong>privacy</strong>, <strong>design</strong>, and <strong>value</strong>.</p>

<h2>What Makes a Great Expense Tracker for India?</h2>
<ul>
  <li><strong>SMS Parsing</strong>: Indian banks send transaction alerts via SMS. A good tracker should read these automatically.</li>
  <li><strong>Multi-bank support</strong>: You likely have SBI, HDFC, and a credit card. The app must handle all of them.</li>
  <li><strong>UPI Detection</strong>: GPay, PhonePe, Paytm — these are how India pays. Your tracker must categorize them intelligently.</li>
  <li><strong>No data selling</strong>: Your financial patterns are extremely personal. The app must not monetize your behaviour.</li>
</ul>

<h2>1. Fiinny — Best Overall 🥇</h2>
<p><strong>Fiinny</strong> is a privacy-first expense tracker built in Hyderabad, India. It uses on-device ML to parse your bank SMS messages and automatically creates categorized expense entries — without ever sending your raw messages to a cloud server.</p>
<p><strong>Key features:</strong></p>
<ul>
  <li>Auto-parsing of all major Indian bank SMS formats (SBI, HDFC, ICICI, Axis, Kotak, etc.)</li>
  <li>Smart UPI detection — identifies GPay, PhonePe, Paytm payments instantly</li>
  <li>Built-in bill splitting (no need for Splitwise)</li>
  <li>Tax Autopilot — fetches Form 26AS and generates ITR JSON in one click</li>
  <li>Free forever tier with no ads</li>
</ul>
<p><strong>Privacy rating: ⭐⭐⭐⭐⭐</strong> — All SMS processing is on-device. No raw financial data leaves your phone.</p>
<p><strong>Download:</strong> Available on iOS App Store and Google Play Store.</p>

<h2>2. Walnut — Good but Abandoned ⚠️</h2>
<p>Walnut was a pioneer in SMS-based expense tracking in India. However, development appears to have slowed significantly, and the app has not received major updates. The UI feels dated and the AI categorization is unreliable for modern UPI transactions.</p>

<h2>3. Money Manager — Basic & Manual</h2>
<p>Money Manager is a solid manual expense tracker with good charts. However, it offers no automatic parsing — you must enter every transaction yourself. For disciplined users who prefer manual control, it works well.</p>

<h2>4. Buxfer — International, Misses India UPI</h2>
<p>Buxfer supports bank connections via Plaid, which does not support Indian banks. UPI transactions are entirely unsupported. Not recommended for Indian users.</p>

<h2>Verdict: What Should You Use?</h2>
<p>If you want the most automated, privacy-respecting expense tracker built specifically for India, <strong>Fiinny</strong> is the clear winner. Its on-device SMS parsing works across all major Indian banks and UPI services, and it's the only tracker that also handles tax filing.</p>
<p><strong>Download Fiinny free</strong> → <a href="https://fiinny.com/download">fiinny.com/download</a></p>`
  },
  {
    slug: "sms-expense-tracking-how-it-works",
    title: "How SMS Expense Tracking Works — And Why it's Safer Than You Think",
    excerpt: "Your phone already receives a bank alert every time money moves. Here's exactly how Fiinny reads those messages on-device to track your finances automatically — and why your data never leaves your phone.",
    seoTitle: "How SMS Expense Tracking Works — On-Device Processing & Privacy Explained",
    seoDescription: "How does SMS-based expense tracking work? Learn how apps like Fiinny parse bank SMS messages on-device without sending data to servers. Why it's safe and private.",
    keywords: ["sms expense tracking how it works", "bank sms parser india", "automatic expense tracker sms", "on device ml expense tracking", "sms permission finance app safe"],
    author: "Arjun Tanpure",
    date: "April 8, 2026",
    readTime: "6 min read",
    categories: ["Technology", "Privacy"],
    published: true,
    content: `<h2>Every Time You Spend Money, Your Phone Already Knows</h2>
<p>When you pay ₹450 at a restaurant via UPI, your bank immediately sends you an SMS message: <em>"Rs.450 debited from your account XXXX4532 via UPI on 14-Apr-26."</em></p>
<p>This message already contains everything needed to track your expense — amount, account, date, and sometimes even the merchant name. The question is: <strong>can an app read this automatically?</strong></p>

<h2>How SMS Parsing Works</h2>
<p>SMS expense trackers request the <code>READ_SMS</code> permission from your Android phone. With this permission, the app can read all SMS messages in your inbox.</p>
<p>The challenge is that each bank writes its transaction SMS in a completely different format:</p>
<ul>
  <li>SBI: <code>Your A/c no. XX4567 is debited with Rs.1,200.00 on 14-Apr-26...</code></li>
  <li>HDFC: <code>HDFC Bank: Rs 580.00 debited from Acct ****4523 on 14-Apr.</code></li>
  <li>ICICI: <code>Dear Customer, INR 299.00 has been debited from your ICICI Bank account.</code></li>
</ul>
<p>A good expense tracker uses a combination of <strong>regex patterns</strong> and <strong>ML classification</strong> to parse all these formats reliably.</p>

<h2>The Privacy Question: Does the App Send Your SMS to a Server?</h2>
<p>This is the critical question. Most apps send your raw SMS messages to their cloud servers for processing. This means a company's server is storing and reading your complete financial history — every salary credit, every medical bill, every transfer.</p>
<p><strong>Fiinny takes a different approach.</strong> Our ML model runs entirely on your phone's processor (Neural Engine on iOS, NPU on Android). Your SMS messages are parsed locally and <em>never transmitted to any server</em>. Only the structured expense data (category, amount, date) is stored — in your own encrypted database on your device.</p>

<h2>What Data Does Fiinny Actually Store?</h2>
<table>
  <thead><tr><th>Data</th><th>Where It Lives</th><th>Sent to Server?</th></tr></thead>
  <tbody>
    <tr><td>Raw SMS text</td><td>Never stored</td><td>Never</td></tr>
    <tr><td>Parsed expense (₹450, "Restaurant", Apr 14)</td><td>On-device encrypted DB</td><td>No</td></tr>
    <tr><td>Category preferences</td><td>On-device</td><td>No</td></tr>
    <tr><td>Account sync (if enabled)</td><td>Firebase (encrypted)</td><td>Only metadata</td></tr>
  </tbody>
</table>

<h2>Is the SMS Permission Safe to Grant?</h2>
<p>Granting <code>READ_SMS</code> to any app is a significant trust decision. You should only grant it to apps that:</p>
<ol>
  <li>Explicitly state they do <strong>not</strong> upload raw SMS to servers</li>
  <li>Are transparent about their data processing (privacy policy + technical whitepaper)</li>
  <li>Process data on-device</li>
</ol>
<p>Fiinny publishes its full <a href="https://fiinny.com/trust">data transparency table</a> so you can verify exactly what is collected and where it lives.</p>

<h2>Why This Is the Future of Personal Finance</h2>
<p>Manual expense tracking doesn't work. Studies show that people stop logging expenses within 2 weeks. SMS-based automatic tracking has an 94% adoption retention because it requires zero effort — your bank already processes the data for you.</p>
<p>The key innovation is making this automation <strong>private by default</strong>. On-device processing means you get the convenience of automation without sacrificing your financial privacy.</p>`
  },
  {
    slug: "india-tax-filing-itr1-guide-2025",
    title: "ITR-1 Filing Guide 2025 — How to File Your Income Tax Return Without a CA",
    excerpt: "Filing ITR-1 in India is simpler than you think. Here's a step-by-step guide — from collecting Form 16 to submitting your return in under 30 minutes.",
    seoTitle: "ITR-1 Filing Guide India 2025 — File Income Tax Return Online Without CA",
    seoDescription: "Complete step-by-step guide to filing ITR-1 in India for the AY 2025-26 assessment year. Learn how to file online, what documents you need, and how to get your refund faster.",
    keywords: ["how to file itr1 india 2025", "income tax return filing india online", "itr 1 guide salaried employees india", "file itr without ca india", "form 16 itr filing guide"],
    author: "Arjun Tanpure",
    date: "April 5, 2026",
    readTime: "10 min read",
    categories: ["Tax", "Personal Finance"],
    published: true,
    content: `<h2>Who Should File ITR-1?</h2>
<p>ITR-1 (also called Sahaj) is the simplest income tax return form in India. You should file ITR-1 if:</p>
<ul>
  <li>Your total income is less than ₹50 lakhs</li>
  <li>Your income comes from salary, one house property, and/or other sources (interest, dividends)</li>
  <li>You are a resident individual (not NRI)</li>
</ul>
<p>If you have capital gains, foreign income, or business income, you will need a different form (ITR-2 or ITR-3).</p>

<h2>Documents You Need Before You Start</h2>
<ol>
  <li><strong>Form 16</strong> — Issued by your employer. Contains your salary breakdown and TDS deducted.</li>
  <li><strong>Form 26AS</strong> — Tax credit statement from the Income Tax Department. Download from incometax.gov.in.</li>
  <li><strong>AIS (Annual Information Statement)</strong> — Lists all transactions reported to the IT department about you.</li>
  <li><strong>Bank Interest Certificates</strong> — From your savings account and FDs.</li>
  <li><strong>Investment Proof</strong> — ELSS, PPF, LIC, home loan certificate for Section 80C deductions.</li>
</ol>

<h2>Step 1: Choose Between Old and New Tax Regime</h2>
<p>Since AY 2024-25, the New Tax Regime is the default. Compare both:</p>
<table>
  <thead><tr><th>Income Slab</th><th>Old Regime</th><th>New Regime</th></tr></thead>
  <tbody>
    <tr><td>Up to ₹2.5L</td><td>0%</td><td>0%</td></tr>
    <tr><td>₹2.5L – ₹5L</td><td>5%</td><td>5%</td></tr>
    <tr><td>₹5L – ₹7.5L</td><td>20%</td><td>10%</td></tr>
    <tr><td>₹7.5L – ₹10L</td><td>20%</td><td>15%</td></tr>
    <tr><td>₹10L – ₹12.5L</td><td>30%</td><td>20%</td></tr>
    <tr><td>Above ₹15L</td><td>30%</td><td>30%</td></tr>
  </tbody>
</table>
<p><strong>Rule of thumb:</strong> If you have significant deductions under 80C (₹1.5L), HRA, and home loan, the Old Regime often results in lower tax. Use a comparison calculator or <a href="https://fiinny.com/tax">Fiinny's Tax Autopilot</a> to automatically compare both.</p>

<h2>Step 2: File on incometax.gov.in</h2>
<ol>
  <li>Go to <strong>incometax.gov.in</strong> and login with your PAN</li>
  <li>Navigate to <strong>e-File → Income Tax Returns → File Income Tax Return</strong></li>
  <li>Select Assessment Year (AY 2025-26 for income earned in FY 2024-25)</li>
  <li>Choose <strong>Online</strong> mode</li>
  <li>Select <strong>ITR-1 (Sahaj)</strong></li>
  <li>The portal will pre-fill data from your Form 26AS and AIS — review carefully</li>
  <li>Add any additional income (savings account interest, etc.)</li>
  <li>Claim deductions (80C, 80D, HRA)</li>
  <li>Compute tax and pay any outstanding amount</li>
  <li>e-Verify using Aadhaar OTP (instant) or Net Banking</li>
</ol>

<h2>Common Mistakes to Avoid</h2>
<ul>
  <li><strong>Not reporting bank interest</strong>: Even ₹500 of savings account interest must be declared</li>
  <li><strong>Missing the AIS data</strong>: The AIS may contain transactions you forgot — a mismatch triggers a notice</li>
  <li><strong>Filing under wrong regime</strong>: Once you file, you cannot switch regimes for that year</li>
  <li><strong>Wrong bank account for refund</strong>: Pre-validate your bank account on the portal for faster refunds</li>
</ul>

<h2>Use Fiinny Tax Autopilot to Skip Most of This</h2>
<p>Fiinny's Tax Autopilot feature connects to official Income Tax Department APIs, fetches your Form 26AS automatically, runs the regime comparison for you, and generates a ready-to-upload ITR-1 JSON file — all in under 5 minutes.</p>
<p>You still e-verify on the official portal (we don't submit on your behalf), but the calculation and form-filling is completely automated.</p>
<p><strong>Try it →</strong> <a href="https://fiinny.com/tax">fiinny.com/tax</a></p>

<h2>When is the Deadline?</h2>
<p>For AY 2025-26, the standard ITR filing deadline is <strong>July 31, 2025</strong> for salaried individuals without audit requirements. Filing before the deadline ensures:</p>
<ul>
  <li>Faster refunds (usually processed within 15-30 days)</li>
  <li>No late filing fee (₹5,000 penalty after deadline)</li>
  <li>Ability to carry forward capital losses</li>
</ul>`
  }
];

export default function SeedPostsPage() {
  const [status, setStatus] = useState<string>("idle");
  const [progress, setProgress] = useState(0);

  const seedAll = async () => {
    setStatus("seeding");
    setProgress(0);
    let done = 0;
    for (const article of ARTICLES) {
      try {
        await BlogService.createPost({ ...article, updatedAt: null });
        done++;
        setProgress(Math.round((done / ARTICLES.length) * 100));
      } catch (err: any) {
        setStatus(`Error on "${article.slug}": ${err.message}`);
        return;
      }
    }
    setStatus("done");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-8 p-8">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-3xl font-black mb-2">Blog Seed Tool</h1>
        <p className="text-slate-400 mb-8">Pushes {ARTICLES.length} SEO articles to Firestore. Run once, then remove this page from production.</p>

        <div className="space-y-3 text-left mb-8 bg-slate-800 rounded-2xl p-6 text-sm">
          {ARTICLES.map((a, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-teal-400 font-mono text-xs">{i + 1}.</span>
              <span className="font-medium">{a.title.slice(0, 60)}...</span>
            </div>
          ))}
        </div>

        {status === "idle" && (
          <button onClick={seedAll} className="w-full py-4 bg-teal-600 hover:bg-teal-700 rounded-2xl font-bold text-lg transition-colors">
            Seed All Articles
          </button>
        )}

        {status === "seeding" && (
          <div className="space-y-4">
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-slate-400">Seeding... {progress}%</p>
          </div>
        )}

        {status === "done" && (
          <div className="bg-teal-900/30 border border-teal-500/30 rounded-2xl p-6">
            <p className="text-teal-400 font-bold text-xl">✅ All articles seeded!</p>
            <p className="text-slate-400 mt-2 text-sm">Check /blog to see them live. Remove or protect this page from production.</p>
          </div>
        )}

        {status.startsWith("Error") && (
          <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-2xl p-4">{status}</p>
        )}
      </div>
    </div>
  );
}