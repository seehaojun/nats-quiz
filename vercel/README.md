# Nat's Quiz Grader (Vercel)

A tiny Vercel Serverless Function that grades open-ended Science answers using
Claude. The static quiz at `/` (root of this repo) calls this function, sends
the student's typed answer, and renders the structured feedback Claude returns.

The grader is split into its own deployable so the Anthropic API key never sits
in the static site.

## Endpoint

`POST /api/grade`

### Request body (JSON)

```json
{
  "question": "Explain why a plant wilts when it does not get enough water.",
  "model_answer": "...",
  "rubric": "Award 1 mark for ...",
  "max_marks": 3,
  "student_answer": "The plant wilts because it has no water in its cells."
}
```

### Response (JSON)

```json
{
  "score": 2,
  "max": 3,
  "what_went_well": "You correctly said the plant wilts because of water in the cells.",
  "what_was_missing": "You didn't mention that the cells become less firm (turgid).",
  "suggested_phrasing": "When a plant doesn't get enough water, ..."
}
```

Errors return `{ "error": "<code>", ... }` with an appropriate HTTP status.

## Deploy

You only need to do this once. Re-deploys after that are `vercel --prod`.

```bash
cd vercel
npm install               # installs @anthropic-ai/sdk
vercel link               # link this directory to a Vercel project (first time only)
vercel env add ANTHROPIC_API_KEY production    # paste your key when prompted
vercel env add ANTHROPIC_API_KEY preview       # (optional — for preview deploys)
vercel --prod
```

After deploy, Vercel prints a URL like `https://nats-quiz-grader.vercel.app`.
The grader endpoint is then at `https://<your-url>/api/grade`.

If your deployed URL differs from `DEFAULT_GRADER_URL` in `js/app.js`, either
edit that constant or override at runtime in the browser DevTools console:

```js
localStorage.setItem('natsquiz-grader-url', 'https://your-deployment.vercel.app/api/grade');
```

## Local development

```bash
cd vercel
npm install
ANTHROPIC_API_KEY=sk-ant-... vercel dev
```

Then in the browser at the static site:

```js
localStorage.setItem('natsquiz-grader-url', 'http://localhost:3000/api/grade');
```

## Locking down CORS (recommended once you know the static URL)

By default the function allows any origin. Once the GitHub Pages URL is known,
restrict access:

```bash
vercel env add ALLOWED_ORIGIN production
# enter e.g. https://seehaojun.github.io
vercel --prod
```

## Cost note

The function uses `claude-haiku-4-5`, currently the cheapest capable Claude
model. Each grade is roughly 500 input tokens + 200 output tokens, so a child
practising 50 open questions per day costs only a few cents per day at current
prices. Monitor usage in the Anthropic console.

## What if the grader is down?

The frontend handles this gracefully: if the fetch fails, it shows the question's
`model_answer` and lets the student self-grade with a "Got it right / Partly
right / Missed it" button. Practice can continue offline.
