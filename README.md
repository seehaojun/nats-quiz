# Nat's Quiz

Interactive P4 quiz app covering Science, English, Math and Chinese for Primary 4 students.

## Features

- Multiple quiz topics across each subject — full chapter MCQ banks plus shared "Tricky", "Hard" and "Comparison" challenge sets
- Open-ended (short-answer) questions graded by Claude with structured feedback
- Instant feedback with explanations for each answer
- Score tracking with progress bar, XP, levels and badges
- Review mode to revisit questions you got wrong
- Play individual topics or all questions combined

## Architecture

- **Static frontend** at the repo root (`index.html`, `css/`, `js/`, `data/`) — no build step.
- **Serverless grader** at `api/grade.js` — calls Claude to score open-ended answers. Lives in the same Vercel project so the Anthropic API key never ships to the browser.

## Local development

Open `index.html` directly in a browser to play with the MCQ portion of the
quiz. Open-ended questions need the grader running, so use:

```bash
npm install
ANTHROPIC_API_KEY=sk-ant-... npx vercel dev
```

Vercel dev serves the static site and the function together at
`http://localhost:3000`.

If you'd rather open `index.html` from `file://` and still test open
questions, point the frontend at a deployed grader from the browser
DevTools console:

```js
localStorage.setItem('natsquiz-grader-url', 'https://<your-deployment>.vercel.app/api/grade');
```

## Deploy to Vercel

One-time setup (assumes you have an Anthropic API key):

```bash
npm install -g vercel        # if you don't have it yet
vercel login
vercel link                  # link this directory to a Vercel project
vercel env add ANTHROPIC_API_KEY production
vercel --prod
```

Re-deploys after that are just `vercel --prod`.

The default grader URL in `js/app.js` is the relative path `/api/grade`, so
it works on any Vercel deployment URL without further changes.

### Optional: lock down CORS

CORS is only relevant if you reach the grader from a different origin (e.g.
local `file://` testing). If you want to restrict access:

```bash
vercel env add ALLOWED_ORIGIN production
# enter e.g. https://your-deployment.vercel.app
vercel --prod
```

## Open-ended questions

Questions of the form

```js
{ type: "open", q, model_answer, rubric, max_marks }
```

are rendered as a textarea. On submit, the student's answer is POSTed to
`/api/grade` with the model answer and rubric. Claude returns structured JSON:

```json
{
  "score": 2,
  "max": 3,
  "what_went_well": "...",
  "what_was_missing": "...",
  "suggested_phrasing": "..."
}
```

The frontend renders this as three coloured feedback sections plus a score.
Open questions never enter timed mode and require manual "Next Question →" so
the student can read the feedback.

If the grader is unreachable (network down, function not deployed, key missing),
the UI gracefully falls back to showing the model answer and offering manual
self-grade buttons. Practice keeps working offline.

## Cost note

The grader uses `claude-haiku-4-5` — currently the cheapest capable Claude
model. Each grade is roughly 500 input + 200 output tokens, so practising
50 open questions per day costs only a few cents. Monitor usage in the
Anthropic console.
