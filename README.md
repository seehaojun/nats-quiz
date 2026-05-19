# Nat's Quiz

Interactive quiz app for Singapore Primary 4 students, covering all four core subjects: Science, English, Math, and Chinese — plus Claude-graded open-ended questions.

## Features

- **4 subjects, 27+ themes, 1,700+ questions** aligned to the MOE P4 syllabus
- **Multiple modes**
  - Standard practice (10–40 questions per topic)
  - Hard / Timed Challenge (30s per question with a speed bonus)
  - Practice Wrong Answers (drills the questions you just missed)
  - Review Mode (spaced re-quizzing of your accumulated wrong-answer bank)
- **Open-Ended Questions** for Science — long-form answers graded by Claude with structured feedback (what went well / missing / a model answer). Falls back to manual self-grade when the grader is unreachable.
- **Motivation system**: XP, 16 levels, daily streaks, daily goal, 12 badges
- **Progress dashboard** with per-subject / per-theme breakdowns and a 7-day streak view
- **Dark mode** with system-preference detection
- **Keyboard shortcuts**: press `1`–`4` (or `A`–`D`) to pick an answer
- **Accessible**: ARIA labels, focus-visible outlines, `prefers-reduced-motion` support
- All progress saved to `localStorage` — survives browser restarts

## Architecture

- **Static frontend** at the repo root — zero dependencies, no build step
  - `index.html` — markup + script tags
  - `css/styles.css` — single stylesheet (light + dark themes via CSS variables)
  - `js/storage.js` — persistence + XP / streak / badges
  - `js/data-loader.js` — subject/theme registry + runtime question-schema validation
  - `js/app.js` — quiz engine, navigation, rendering
  - `data/*.js` — question banks, one per theme
- **Serverless grader** at `api/grade.js` — calls Claude to score open-ended answers. Same Vercel project, so the Anthropic API key never ships to the browser.

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

## Question format

Each question file attaches to `window.QUIZ_DATA[themeName]`:

```js
window.QUIZ_DATA.diversity = {
  ch1: [
    { q: "Question text?", opts: ["A", "B", "C", "D"], ans: 0, explain: "Why A is correct." },
    // ...
  ],
  ch2: [ /* ... */ ],
  tricky: [ /* harder mixed questions */ ],
  hard: [ /* timed challenge questions */ ],
};
```

The correct answer is always at index `0` in the source data; the engine shuffles options at runtime.

### Open-ended questions

```js
{ type: "open", q, model_answer, rubric, max_marks }
```

Rendered as a textarea. On submit, the student's answer is POSTed to
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
