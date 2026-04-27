// Vercel Serverless Function: grades a student's short-answer Science response
// using Claude.
//
// Expected POST body (JSON):
//   {
//     question: string,         // the question shown to the student
//     model_answer: string,     // an example "good" answer
//     rubric: string,           // marking guidance for partial credit
//     max_marks: number,        // 1..N
//     student_answer: string    // what the student wrote
//   }
//
// Returns (JSON):
//   {
//     score: number,            // 0..max
//     max: number,              // echoes max_marks
//     what_went_well: string,
//     what_was_missing: string,
//     suggested_phrasing: string
//   }
//
// Errors return { error: "<code>", ... } with appropriate HTTP status.

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const SYSTEM_PROMPT = `You are a kind P4 (age 10) Singapore primary school Science teacher grading a short answer.

Respond with ONLY valid JSON in this exact shape:
{
  "score": <integer from 0 to max_marks>,
  "max": <integer equal to max_marks>,
  "what_went_well": <short string, encouraging — what the student got right>,
  "what_was_missing": <short string — concepts from the rubric they missed; empty string if perfect>,
  "suggested_phrasing": <short string — a clear example of how a strong answer could be phrased at P4 level>
}

Rules:
- Use simple words a 10-year-old understands.
- Be encouraging. Always acknowledge any partial knowledge.
- Award marks based ONLY on the rubric. Use whole-number marks.
- If the student's answer is empty, irrelevant, or off-topic, score 0.
- Do not include any prose outside the JSON object.`;

function buildUserPrompt({ question, model_answer, rubric, max_marks, student_answer }) {
  return `Question: ${question}
Max marks: ${max_marks}
Model answer: ${model_answer}
Marking rubric: ${rubric}

Student's answer:
"""
${student_answer}
"""

Return JSON only.`;
}

function setCors(res, allowed) {
  res.setHeader("Access-Control-Allow-Origin", allowed || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
}

function extractJson(text) {
  if (!text) return null;
  // Tolerate models that wrap JSON in prose by grabbing the first {...} block.
  const match = text.match(/\{[\s\S]*\}/);
  const raw = match ? match[0] : text;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  setCors(res, process.env.ALLOWED_ORIGIN);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "bad_json" }); }
  }
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "missing_body" });
  }

  const { question, model_answer, rubric, max_marks, student_answer } = body;
  if (!question || !model_answer || !student_answer) {
    return res.status(400).json({ error: "missing_fields" });
  }
  const max = Number(max_marks);
  if (!Number.isFinite(max) || max < 1 || max > 10) {
    return res.status(400).json({ error: "bad_max_marks" });
  }
  if (typeof student_answer !== "string" || student_answer.length > 2000) {
    return res.status(400).json({ error: "answer_too_long" });
  }

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildUserPrompt({
            question,
            model_answer,
            rubric: rubric || "(no explicit rubric — grade against the model answer.)",
            max_marks: max,
            student_answer,
          }),
        },
      ],
    });

    const text = msg.content?.[0]?.type === "text" ? msg.content[0].text : "";
    const parsed = extractJson(text);
    if (!parsed) {
      return res.status(502).json({ error: "parse_failed", raw: text });
    }

    // Clamp & coerce so the client never sees nonsense.
    const score = Math.max(0, Math.min(max, Math.round(Number(parsed.score) || 0)));
    return res.status(200).json({
      score,
      max,
      what_went_well: String(parsed.what_went_well || ""),
      what_was_missing: String(parsed.what_was_missing || ""),
      suggested_phrasing: String(parsed.suggested_phrasing || ""),
    });
  } catch (err) {
    return res.status(502).json({ error: "upstream_failed", detail: String(err && err.message || err) });
  }
}
