# Nat's Quiz

Interactive P4 quiz app covering Science, English, Math and Chinese for Primary 4 students.

## Features

- Multiple quiz topics across each subject — full chapter MCQ banks plus shared "Tricky", "Hard" and "Comparison" challenge sets
- Open-ended (short-answer) questions graded by Claude with structured feedback (see below)
- Instant feedback with explanations for each answer
- Score tracking with progress bar, XP, levels and badges
- Review mode to revisit questions you got wrong
- Play individual topics or all questions combined

## Tech

Single-file HTML app — no build tools or dependencies. Just open `index.html` in a browser.

## Usage

```
open index.html
```

Or visit via GitHub Pages if enabled.

## Open-ended questions (LLM grading)

Questions of the form `{ type: "open", q, model_answer, rubric, max_marks }` are
rendered as a textarea. When the student submits, their answer is sent to a
small Vercel Serverless Function (`/vercel`) which calls Claude to score it
against the rubric and return structured feedback.

See `vercel/README.md` for deploy instructions. If the grader is unreachable,
the app falls back to showing the model answer and lets the student self-grade.
