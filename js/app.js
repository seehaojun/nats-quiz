// Nat's Quiz — P4 Quiz Engine with motivation system
(() => {

const CONFIG = {
  HARD_TIME_LIMIT: 30,
  AUTO_ADVANCE_DELAY: 1000,
  REVIEW_BATCH_SIZE: 20,
  OPTION_KEYS: ['A', 'B', 'C', 'D'],
  // Same-origin: the grader is deployed alongside the static site on Vercel.
  // localStorage override is still useful for opening index.html via file://
  // (where relative URLs can't resolve) or pointing at a staging deployment.
  DEFAULT_GRADER_URL: '/api/grade',
};

const state = {
  currentSubject: '',
  currentTheme: '',
  currentTopic: '',
  currentQuestions: [],
  currentIndex: 0,
  score: 0,
  answered: false,
  wrongAnswers: [],
  isHardMode: false,
  hardScore: 0,
  timerInterval: null,
  timerStart: 0,
  autoAdvanceTimer: null,
  isPracticeMode: false,
  isReviewMode: false,
  lastTopic: null,
  openMarksAwarded: 0,
  openMarksMax: 0,
};

const $ = id => document.getElementById(id);

function getGraderUrl() {
  try {
    const override = localStorage.getItem('natsquiz-grader-url');
    if (override) return override;
  } catch (e) {}
  return CONFIG.DEFAULT_GRADER_URL;
}

// Format fractional scores nicely (whole number when possible, else 1 decimal).
function formatScore(s) {
  return Math.abs(s - Math.round(s)) < 0.001 ? String(Math.round(s)) : s.toFixed(1);
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// ── Screens ──

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => { s.style.display = 'none'; });
  $(id).style.display = 'block';
  window.scrollTo(0, 0);
}

function clearTimers() {
  if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
  if (state.autoAdvanceTimer) { clearTimeout(state.autoAdvanceTimer); state.autoAdvanceTimer = null; }
}

// ── Dashboard ──

function renderDashboard() {
  showScreen('dashboardScreen');
  const data = QuizStorage.getData();

  // Stats bar
  const levelTitle = QuizStorage.getLevelTitle(data.level);
  const nextXp = QuizStorage.xpForLevel(data.level + 1);
  const currXp = QuizStorage.xpForLevel(data.level);
  const progressPct = nextXp > currXp
    ? Math.min(100, Math.round((data.xp - currXp) / (nextXp - currXp) * 100))
    : 100;
  const accuracy = data.totalAnswered > 0
    ? Math.round(data.totalCorrect / data.totalAnswered * 100) + '% correct'
    : 'Start quizzing!';

  $('dashStats').innerHTML = `
    <div class="stat-row">
      <div class="stat-box">
        <div class="stat-value">${data.level}</div>
        <div class="stat-label">${levelTitle}</div>
        <div class="xp-bar"><div class="xp-fill" style="width:${progressPct}%"></div></div>
        <div class="stat-sub">${data.xp} / ${nextXp} XP</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${data.streak || 0}</div>
        <div class="stat-label">Day Streak</div>
        <div class="stat-sub">${data.streak >= 3 ? '🔥' : ''}</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${data.totalAnswered}</div>
        <div class="stat-label">Questions Done</div>
        <div class="stat-sub">${accuracy}</div>
      </div>
    </div>`;

  // Daily progress
  const dailyDone = QuizStorage.getDailyProgress(data);
  const dailyTarget = data.dailyTarget;
  const dailyPct = Math.min(100, Math.round(dailyDone / dailyTarget * 100));
  $('dailyProgress').innerHTML = `
    <div class="daily-bar-label">
      <span>Today's Goal: ${dailyDone} / ${dailyTarget} questions</span>
      ${dailyDone >= dailyTarget ? '<span class="daily-done">Done!</span>' : ''}
    </div>
    <div class="daily-bar"><div class="daily-fill" style="width:${dailyPct}%"></div></div>`;

  // Dashboard action buttons
  const actionsEl = $('dashboardActions');
  const wrongBankCount = (data.wrongBank || []).length;
  let actionsHtml = '';
  if (wrongBankCount > 0) {
    actionsHtml += `<button class="dash-action-btn review-btn" type="button" data-action="review">
      Review Wrong Answers <span class="review-count">${wrongBankCount}</span></button>`;
  }
  actionsHtml += '<button class="dash-action-btn progress-btn" type="button" data-action="progress">Progress</button>';
  actionsEl.innerHTML = actionsHtml;
  actionsEl.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.action === 'review') startReviewMode();
      else if (btn.dataset.action === 'progress') showProgress();
    });
  });

  // Subject grid
  const grid = $('subjectGrid');
  grid.innerHTML = '';
  for (const id in QuizLoader.subjects) {
    const s = QuizLoader.subjects[id];
    const count = QuizLoader.getSubjectQuestionCount(id);
    const themes = QuizLoader.getThemesForSubject(id);
    const hasContent = themes.some(t => t.loaded);

    const card = document.createElement('div');
    card.className = 'subject-card' + (hasContent ? '' : ' disabled');
    card.setAttribute('role', 'listitem');
    card.style.borderColor = s.color;
    if (hasContent) {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `${s.name}, ${count} questions`);
      const select = () => selectSubject(id);
      card.addEventListener('click', select);
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); }
      });
    }
    card.innerHTML = `
      <div class="subject-icon" aria-hidden="true">${s.icon}</div>
      <div class="subject-name" style="color:${s.color}">${s.name}</div>
      <div class="subject-count">${hasContent ? count + ' questions' : 'Coming soon'}</div>`;
    grid.appendChild(card);
  }

  renderBadges(data);
}

function renderBadges(data) {
  const section = $('badgesSection');
  const earned = data.badges || [];
  if (earned.length === 0 && data.totalAnswered === 0) {
    section.innerHTML = '';
    return;
  }

  const badges = QuizStorage.BADGE_DEFS.map(b => {
    const has = earned.includes(b.id);
    return `<div class="badge-item${has ? ' earned' : ''}" title="${b.desc}" aria-label="${b.name}: ${b.desc}${has ? ' (earned)' : ' (locked)'}">
      <div class="badge-icon" aria-hidden="true">${has ? b.icon : '🔒'}</div>
      <div class="badge-name">${b.name}</div>
    </div>`;
  }).join('');

  section.innerHTML = `<h2 class="section-title">Badges</h2><div class="badge-grid">${badges}</div>`;
}

// ── Subject Selection ──

function selectSubject(subjectId) {
  state.currentSubject = subjectId;
  showScreen('themeScreen');
  const s = QuizLoader.subjects[subjectId];
  $('themeScreenTitle').textContent = s.name;
  $('themeScreenDesc').textContent = `${s.desc} — Pick a theme`;
  renderThemeScreen();
}

// ── Theme Selection ──

function renderThemeScreen() {
  const themes = QuizLoader.getThemesForSubject(state.currentSubject);
  const grid = $('themeGrid');
  grid.innerHTML = '';
  const data = QuizStorage.getData();

  themes.forEach(t => {
    const card = document.createElement('div');
    card.className = `theme-card ${t.color}${t.loaded ? '' : ' disabled'}`;
    card.setAttribute('role', 'listitem');

    // Best score for this theme
    let bestHtml = '';
    const themeScoreKey = `${state.currentSubject}/${t.id}`;
    for (const key in data.scores) {
      if (key.startsWith(themeScoreKey) && data.scores[key].best > 0) {
        bestHtml = `<div class="theme-best">Best: ${data.scores[key].best}%</div>`;
        break;
      }
    }

    card.innerHTML = `
      <div class="theme-icon" aria-hidden="true">${t.icon}</div>
      <div class="theme-name">${t.name}</div>
      <div class="theme-count">${t.loaded ? t.questionCount + ' questions' : 'Coming soon'}</div>
      ${bestHtml}`;

    if (t.loaded) {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `${t.name}, ${t.questionCount} questions`);
      const select = () => selectTheme(t.id);
      card.addEventListener('click', select);
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); }
      });
    }
    grid.appendChild(card);
  });
}

function selectTheme(themeId) {
  state.currentTheme = themeId;
  const data = QuizLoader.getThemeData(themeId);
  const names = QuizLoader.getCategoryNames(themeId);
  const info = QuizLoader.themes[themeId];

  showScreen('homeScreen');
  $('homeTitle').textContent = info.name;
  $('homeSubtitle').textContent = info.description;

  const container = $('topicButtons');
  container.innerHTML = '';

  const regularCats = [];
  const timedCats = [];
  let allCount = 0;
  const storageData = QuizStorage.getData();

  for (const key in data) {
    if (key === 'hard' || key === 'compare') {
      timedCats.push(key);
    } else {
      regularCats.push(key);
      allCount += data[key].length;
    }
  }

  regularCats.forEach(cat => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'topic-btn';
    if (cat === 'notqs')    btn.style.cssText = 'border-color:#f6ad55;color:#c05621;';
    if (cat === 'plantsys') btn.style.cssText = 'border-color:#9ae6b4;color:#276749;';
    if (cat === 'apply')    btn.style.cssText = 'border-color:#d6bcfa;color:#553c9a;';

    const scoreKey = `${state.currentSubject}/${state.currentTheme}/${cat}`;
    const bestInfo = storageData.scores[scoreKey];
    const bestHtml = bestInfo && bestInfo.best > 0
      ? ` <span class="topic-best">Best: ${bestInfo.best}%</span>` : '';

    btn.innerHTML = `${names[cat] || cat}${bestHtml} <span class="count">${data[cat].length} questions</span>`;
    btn.addEventListener('click', () => startQuiz(cat));
    container.appendChild(btn);
  });

  timedCats.forEach(cat => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'topic-btn ' + (cat === 'compare' ? 'compare-btn' : 'hard-btn');
    btn.innerHTML = `${names[cat] || cat} (Timed Challenge) <span class="count">${data[cat].length} questions — timed!</span>`;
    btn.addEventListener('click', () => startQuiz(cat));
    container.appendChild(btn);
  });

  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = 'topic-btn all-btn';
  allBtn.innerHTML = `ALL QUESTIONS <span class="count">${allCount} questions</span>`;
  allBtn.addEventListener('click', () => startQuiz('all'));
  container.appendChild(allBtn);
}

// ── Quiz Engine ──

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startQuiz(topic) {
  const data = QuizLoader.getThemeData(state.currentTheme);
  state.currentTopic = topic;
  state.isHardMode = (topic === 'hard' || topic === 'compare');
  state.isPracticeMode = false;
  state.isReviewMode = false;
  state.hardScore = 0;
  state.openMarksAwarded = 0;
  state.openMarksMax = 0;
  clearTimers();

  if (topic === 'all') {
    let allQs = [];
    for (const key in data) {
      if (key !== 'hard' && key !== 'compare') allQs = allQs.concat(data[key]);
    }
    state.currentQuestions = shuffle(allQs);
    $('topicTitle').textContent = 'All Questions';
  } else {
    state.currentQuestions = shuffle(data[topic].slice());
    const names = QuizLoader.getCategoryNames(state.currentTheme);
    $('topicTitle').textContent = names[topic] || topic;
  }

  // Open-ended questions never enter timed mode — they need think time.
  if (state.isHardMode) {
    state.currentQuestions = state.currentQuestions.filter(q => q.type !== 'open');
  }

  state.lastTopic = topic;
  state.currentIndex = 0;
  state.score = 0;
  state.wrongAnswers = [];
  state.answered = false;

  showScreen('quizScreen');
  $('timerBar').style.display = state.isHardMode ? 'block' : 'none';
  $('timerText').style.display = state.isHardMode ? 'block' : 'none';
  $('hardScoreDisplay').style.display = state.isHardMode ? 'block' : 'none';
  $('scoreDisplay').style.display = state.isHardMode ? 'none' : 'block';
  showQuestion();
}

function showQuestion() {
  state.answered = false;
  clearTimers();
  const q = state.currentQuestions[state.currentIndex];
  const qNumText = `Question ${state.currentIndex + 1} of ${state.currentQuestions.length}`;
  const qNumEl = $('qNumber');
  if (state.isPracticeMode) {
    qNumEl.innerHTML = `${qNumText} <span class="mode-label practice">Practice Mode</span>`;
  } else if (state.isReviewMode) {
    qNumEl.innerHTML = `${qNumText} <span class="mode-label review">Review Mode</span>`;
  } else {
    qNumEl.textContent = qNumText;
  }
  $('qText').textContent = q.q;
  $('scoreDisplay').textContent = `${formatScore(state.score)} / ${state.currentQuestions.length}`;

  const progressPct = state.currentIndex / state.currentQuestions.length * 100;
  $('progressFill').style.width = `${progressPct}%`;
  const progressBar = $('progressFill').parentElement;
  if (progressBar) progressBar.setAttribute('aria-valuenow', String(Math.round(progressPct)));

  // Tear down any open-Q UI from the previous question.
  removeOpenQuestionUI();

  if (q.type === 'open') {
    showOpenQuestion(q);
    return;
  }

  // MCQ rendering
  $('optionsList').style.display = '';
  const indices = q.opts.map((_, i) => i);
  const shuffled = shuffle(indices);
  const list = $('optionsList');
  list.innerHTML = '';
  shuffled.forEach((origIdx, displayPos) => {
    const li = document.createElement('li');
    li.textContent = q.opts[origIdx];
    li.dataset.idx = String(origIdx);
    li.dataset.key = CONFIG.OPTION_KEYS[displayPos] || '';
    li.setAttribute('role', 'option');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-label', `${CONFIG.OPTION_KEYS[displayPos] || ''}: ${q.opts[origIdx]}`);
    li.addEventListener('click', () => pickAnswer(li, origIdx));
    li.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickAnswer(li, origIdx); }
    });
    list.appendChild(li);
  });

  $('explanation').style.display = 'none';
  $('timeBonus').style.display = 'none';

  if (state.isHardMode) {
    $('hardScoreDisplay').innerHTML = `Points: <span class="pts">${state.hardScore.toFixed(2)}</span>`;
    state.timerStart = Date.now();
    const fill = $('timerFill');
    const text = $('timerText');
    fill.style.width = '100%';
    fill.className = 'timer-fill';
    text.className = 'timer-text';
    text.textContent = `${CONFIG.HARD_TIME_LIMIT}s`;
    state.timerInterval = setInterval(() => {
      const elapsed = (Date.now() - state.timerStart) / 1000;
      const remaining = Math.max(0, CONFIG.HARD_TIME_LIMIT - elapsed);
      const pct = (remaining / CONFIG.HARD_TIME_LIMIT) * 100;
      fill.style.width = `${pct}%`;
      text.textContent = `${remaining.toFixed(1)}s`;
      if (remaining <= 5) { fill.className = 'timer-fill danger'; text.className = 'timer-text danger'; }
      else if (remaining <= 10) { fill.className = 'timer-fill warn'; text.className = 'timer-text warn'; }
      if (remaining <= 0) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        hardTimeUp();
      }
    }, 100);
  }
}

function hardTimeUp() {
  if (state.answered) return;
  state.answered = true;
  const q = state.currentQuestions[state.currentIndex];
  state.hardScore -= 0.25;
  document.querySelectorAll('#optionsList li').forEach(li => {
    li.classList.add('disabled');
    if (parseInt(li.dataset.idx, 10) === q.ans) li.classList.add('correct');
  });
  state.wrongAnswers.push({
    question: q.q, yourAnswer: "(Time's up!)", correctAnswer: q.opts[q.ans], explain: q.explain
  });
  $('hardScoreDisplay').innerHTML = `Points: <span class="pts">${state.hardScore.toFixed(2)}</span>`;
  $('explanation').textContent = q.explain;
  $('explanation').style.display = 'block';
  const tb = $('timeBonus');
  tb.textContent = "Time's up! -0.25 pts";
  tb.className = 'time-bonus penalty';
  tb.style.display = 'block';
  state.autoAdvanceTimer = setTimeout(nextQuestion, CONFIG.AUTO_ADVANCE_DELAY);
}

// ── Open-ended questions ──

function removeOpenQuestionUI() {
  const existing = $('openQuestionBox');
  if (existing) existing.parentNode.removeChild(existing);
  const existingNext = $('openNextBtn');
  if (existingNext) existingNext.parentNode.removeChild(existingNext);
}

function showOpenQuestion(q) {
  // Hide MCQ-specific UI
  $('optionsList').style.display = 'none';
  $('explanation').style.display = 'none';
  $('timeBonus').style.display = 'none';

  const card = document.querySelector('#quizScreen .question-card');
  const box = document.createElement('div');
  box.id = 'openQuestionBox';
  box.className = 'open-box';
  const maxMarks = q.max_marks || 3;
  box.innerHTML = `
    <div class="open-marks-label">Open-Ended &middot; ${maxMarks} mark${maxMarks === 1 ? '' : 's'}</div>
    <textarea id="openAnswer" class="open-textarea" placeholder="Type your answer in your own words..." maxlength="2000" aria-label="Your answer"></textarea>
    <div class="open-actions">
      <button id="openSubmit" class="open-submit-btn" type="button">Check My Answer</button>
    </div>
    <div id="openFeedback" class="open-feedback" role="status" aria-live="polite" style="display:none"></div>`;
  card.appendChild(box);

  $('openSubmit').addEventListener('click', submitOpenAnswer);
  setTimeout(() => {
    const ta = $('openAnswer');
    if (ta) ta.focus();
  }, 50);
}

function submitOpenAnswer() {
  if (state.answered) return;
  const q = state.currentQuestions[state.currentIndex];
  const ta = $('openAnswer');
  const btn = $('openSubmit');
  const feedback = $('openFeedback');
  const studentAnswer = (ta.value || '').trim();
  if (!studentAnswer) {
    ta.classList.add('open-textarea-error');
    setTimeout(() => ta.classList.remove('open-textarea-error'), 600);
    return;
  }
  state.answered = true;
  ta.disabled = true;
  btn.disabled = true;
  btn.textContent = 'Asking Claude...';
  feedback.style.display = 'block';
  feedback.className = 'open-feedback open-feedback-loading';
  feedback.innerHTML = '<span class="open-spinner" aria-hidden="true"></span> Asking Claude to grade your answer...';

  const maxMarks = q.max_marks || 3;
  const payload = {
    question: q.q,
    model_answer: q.model_answer || '',
    rubric: q.rubric || '',
    max_marks: maxMarks,
    student_answer: studentAnswer,
  };

  fetch(getGraderUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(r => {
      if (!r.ok) throw new Error('grader_http_' + r.status);
      return r.json();
    })
    .then(data => {
      if (data && data.error) throw new Error(data.error);
      const max = (typeof data.max === 'number') ? data.max : maxMarks;
      const rawScore = (typeof data.score === 'number') ? data.score : 0;
      const awardedScore = Math.max(0, Math.min(max, rawScore));
      renderOpenFeedback(q, studentAnswer, awardedScore, max, data);
      recordOpenResult(q, studentAnswer, awardedScore, max, data);
    })
    .catch(err => {
      // Graceful offline fallback: show model answer and let user self-grade.
      renderOpenFallback(q, studentAnswer, err);
    });
}

function renderOpenFeedback(q, studentAnswer, awardedScore, max, data) {
  const feedback = $('openFeedback');
  feedback.className = 'open-feedback';
  const pct = max > 0 ? (awardedScore / max) : 0;
  const scoreClass = pct >= 0.85 ? 'open-score-good' : (pct >= 0.5 ? 'open-score-partial' : 'open-score-low');
  let html = `<div class="open-score ${scoreClass}">Score: ${formatScore(awardedScore)} / ${max}</div>`;
  if (data && data.what_went_well) {
    html += `<div class="feedback-row feedback-good">
      <div class="feedback-label">What went well</div>
      <div class="feedback-body">${escapeHtml(data.what_went_well)}</div>
    </div>`;
  }
  if (data && data.what_was_missing) {
    html += `<div class="feedback-row feedback-missing">
      <div class="feedback-label">What was missing</div>
      <div class="feedback-body">${escapeHtml(data.what_was_missing)}</div>
    </div>`;
  }
  const modelAnswerText = (data && data.suggested_phrasing) || q.model_answer;
  if (modelAnswerText) {
    html += `<div class="feedback-row feedback-suggest">
      <div class="feedback-label">A model answer</div>
      <div class="feedback-body">${escapeHtml(modelAnswerText)}</div>
    </div>`;
  }
  feedback.innerHTML = html;
  appendOpenNextButton();
}

function renderOpenFallback(q, studentAnswer /* , err */) {
  const feedback = $('openFeedback');
  feedback.className = 'open-feedback open-feedback-fallback';
  const maxMarks = q.max_marks || 3;
  feedback.innerHTML = `
    <div class="feedback-row feedback-missing">
      <div class="feedback-label">Couldn't reach the grader</div>
      <div class="feedback-body">No internet, or the grader isn't deployed yet. Compare your answer with the model answer below and self-grade.</div>
    </div>
    <div class="feedback-row feedback-suggest">
      <div class="feedback-label">Model answer</div>
      <div class="feedback-body">${escapeHtml(q.model_answer || '(no model answer provided)')}</div>
    </div>
    <div class="open-self-grade">
      <div class="open-self-grade-label">How did you do?</div>
      <button type="button" class="self-grade-btn self-grade-full" data-marks="${maxMarks}">Got it right (${maxMarks}/${maxMarks})</button>
      ${maxMarks >= 2 ? `<button type="button" class="self-grade-btn self-grade-partial" data-marks="${Math.ceil(maxMarks / 2)}">Partly right (${Math.ceil(maxMarks / 2)}/${maxMarks})</button>` : ''}
      <button type="button" class="self-grade-btn self-grade-none" data-marks="0">Missed it (0/${maxMarks})</button>
    </div>`;
  const btns = feedback.querySelectorAll('.self-grade-btn');
  btns.forEach(b => {
    b.addEventListener('click', () => {
      const marks = parseInt(b.dataset.marks, 10) || 0;
      btns.forEach(x => { x.disabled = true; });
      b.classList.add('selected');
      const fakeData = {
        score: marks,
        max: maxMarks,
        what_went_well: marks === maxMarks ? 'You said you got it right — well done!' : '',
        what_was_missing: marks < maxMarks ? 'Compare your answer with the model answer above.' : '',
        suggested_phrasing: q.model_answer || '',
      };
      recordOpenResult(q, studentAnswer, marks, maxMarks, fakeData);
      appendOpenNextButton();
    });
  });
}

function recordOpenResult(q, studentAnswer, awardedScore, max, data) {
  const pct = max > 0 ? (awardedScore / max) : 0;
  // Add fractional credit toward total score.
  state.score += pct;
  state.openMarksAwarded += awardedScore;
  state.openMarksMax += max;
  $('scoreDisplay').textContent = `${formatScore(state.score)} / ${state.currentQuestions.length}`;

  // In review mode, remove perfectly answered questions from wrong bank.
  if (state.isReviewMode && pct >= 0.999) {
    QuizStorage.removeFromWrongBank(q.q);
  }

  // Push to wrong list if not perfect, with extended fields for review.
  if (pct < 0.999) {
    state.wrongAnswers.push({
      question: q.q,
      yourAnswer: studentAnswer,
      correctAnswer: q.model_answer || '',
      explain: (data && data.what_was_missing) ? data.what_was_missing : (q.model_answer || ''),
      type: 'open',
      studentAnswer,
      modelAnswer: q.model_answer || '',
      feedback: {
        score: awardedScore,
        max,
        what_went_well: (data && data.what_went_well) || '',
        what_was_missing: (data && data.what_was_missing) || '',
        suggested_phrasing: (data && data.suggested_phrasing) || '',
      },
      maxMarks: max,
    });
  }
}

function appendOpenNextButton() {
  if ($('openNextBtn')) return;
  const card = document.querySelector('#quizScreen .question-card');
  const btn = document.createElement('button');
  btn.id = 'openNextBtn';
  btn.className = 'open-next-btn';
  btn.type = 'button';
  btn.textContent = (state.currentIndex + 1 < state.currentQuestions.length) ? 'Next Question →' : 'See Results →';
  btn.addEventListener('click', nextQuestion);
  card.appendChild(btn);
  setTimeout(() => btn.focus(), 50);
}

function pickAnswer(el, idx) {
  if (state.answered) return;
  state.answered = true;
  if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
  const q = state.currentQuestions[state.currentIndex];
  document.querySelectorAll('#optionsList li').forEach(li => {
    li.classList.add('disabled');
    if (parseInt(li.dataset.idx, 10) === q.ans) li.classList.add('correct');
  });
  const tb = $('timeBonus');
  if (state.isHardMode) {
    const elapsed = (Date.now() - state.timerStart) / 1000;
    const remaining = Math.max(0, CONFIG.HARD_TIME_LIMIT - elapsed);
    if (idx === q.ans) {
      state.score++;
      el.classList.add('correct');
      const timeBonus = remaining / CONFIG.HARD_TIME_LIMIT;
      const totalPts = 1 + timeBonus;
      state.hardScore += totalPts;
      tb.textContent = `+${totalPts.toFixed(2)} pts (speed bonus: +${timeBonus.toFixed(2)})`;
      tb.className = 'time-bonus';
      tb.style.display = 'block';
    } else {
      el.classList.add('wrong');
      state.hardScore -= 0.25;
      state.wrongAnswers.push({
        question: q.q, yourAnswer: q.opts[idx], correctAnswer: q.opts[q.ans], explain: q.explain
      });
      tb.textContent = '-0.25 pts';
      tb.className = 'time-bonus penalty';
      tb.style.display = 'block';
    }
    $('hardScoreDisplay').innerHTML = `Points: <span class="pts">${state.hardScore.toFixed(2)}</span>`;
  } else {
    if (idx === q.ans) {
      state.score++;
      el.classList.add('correct');
      if (state.isReviewMode) QuizStorage.removeFromWrongBank(q.q);
    } else {
      el.classList.add('wrong');
      state.wrongAnswers.push({
        question: q.q, yourAnswer: q.opts[idx], correctAnswer: q.opts[q.ans], explain: q.explain
      });
    }
    $('scoreDisplay').textContent = `${formatScore(state.score)} / ${state.currentQuestions.length}`;
    tb.style.display = 'none';
  }
  $('explanation').textContent = q.explain;
  $('explanation').style.display = 'block';
  state.autoAdvanceTimer = setTimeout(nextQuestion, CONFIG.AUTO_ADVANCE_DELAY);
}

function nextQuestion() {
  if (state.autoAdvanceTimer) { clearTimeout(state.autoAdvanceTimer); state.autoAdvanceTimer = null; }
  state.currentIndex++;
  if (state.currentIndex >= state.currentQuestions.length) showResults();
  else showQuestion();
}

function showResults() {
  clearTimers();

  const openMarks = state.openMarksMax > 0
    ? { awarded: state.openMarksAwarded, max: state.openMarksMax }
    : null;

  let result;
  if (state.isPracticeMode || state.isReviewMode) {
    result = { xpGained: 0, newBadges: [], level: 0, streak: 0 };
  } else {
    result = QuizStorage.recordQuizResult(
      state.currentSubject, state.currentTheme, state.currentTopic,
      state.currentQuestions.length, state.score, state.wrongAnswers, openMarks
    );
  }

  showScreen('resultsScreen');
  const g = $('gradeLabel');
  let pct;
  if (state.isHardMode) {
    const maxPossible = state.currentQuestions.length * 2;
    $('finalScore').innerHTML = `${state.hardScore.toFixed(2)} <span>/ ${maxPossible} pts</span>`;
    pct = Math.round((state.score / state.currentQuestions.length) * 100);
  } else {
    pct = Math.round((state.score / state.currentQuestions.length) * 100);
    $('finalScore').innerHTML = `${formatScore(state.score)} <span>/ ${state.currentQuestions.length} (${pct}%)</span>`;
  }
  if (pct >= 90)      { g.textContent = 'Excellent!';            g.className = 'grade gold'; }
  else if (pct >= 70) { g.textContent = 'Good Job!';             g.className = 'grade silver'; }
  else if (pct >= 50) { g.textContent = 'Keep Trying!';          g.className = 'grade bronze'; }
  else                { g.textContent = 'Study More & Try Again!'; g.className = 'grade try'; }

  const xpEl = $('xpGained');
  if (state.isPracticeMode || state.isReviewMode) {
    xpEl.innerHTML = `${state.isPracticeMode ? 'Practice Mode' : 'Review Mode'} — no XP awarded`;
  } else {
    xpEl.innerHTML = `+${result.xpGained} XP` +
      (result.streak > 1 ? ` &middot; ${result.streak}-day streak 🔥` : '');
  }
  xpEl.style.display = 'block';

  const nbEl = $('newBadges');
  if (result.newBadges.length > 0) {
    const badgeHtml = result.newBadges.map(bid => {
      const def = QuizStorage.BADGE_DEFS.find(b => b.id === bid);
      return def ? `<div class="new-badge">${def.icon} ${def.name}</div>` : '';
    }).join('');
    nbEl.innerHTML = `<div class="new-badge-label">New Badge!</div>${badgeHtml}`;
    nbEl.style.display = 'block';
  } else {
    nbEl.style.display = 'none';
  }

  const practiceBtn = $('practiceWrongBtn');
  if (practiceBtn) {
    practiceBtn.style.display = (state.wrongAnswers.length > 0 && !state.isPracticeMode) ? 'inline-block' : 'none';
  }

  const wl = $('wrongList');
  if (state.wrongAnswers.length === 0) {
    wl.innerHTML = '<p style="color:var(--correct-accent);font-weight:600;margin-top:12px;">Perfect! Every answer correct!</p>';
  } else {
    const items = state.wrongAnswers.map((w, i) => {
      let body;
      if (w.type === 'open') {
        const fb = w.feedback || {};
        const wellRow = fb.what_went_well
          ? `<div class="wi-open-row wi-open-good"><span class="wi-open-label">What went well:</span> ${escapeHtml(fb.what_went_well)}</div>` : '';
        const missingRow = fb.what_was_missing
          ? `<div class="wi-open-row wi-open-missing"><span class="wi-open-label">What was missing:</span> ${escapeHtml(fb.what_was_missing)}</div>` : '';
        const modelRow = w.modelAnswer
          ? `<div class="wi-a">Model answer: ${escapeHtml(w.modelAnswer)}</div>` : '';
        body = `
          <div class="wi-open-score">Score: ${formatScore(fb.score || 0)} / ${fb.max || w.maxMarks || 0}</div>
          <div class="wi-open-row"><span class="wi-open-label">Your answer:</span> ${escapeHtml(w.studentAnswer || '')}</div>
          ${wellRow}${missingRow}${modelRow}`;
      } else {
        body = `
          <div style="color:var(--wrong-accent);">You picked: ${escapeHtml(w.yourAnswer)}</div>
          <div class="wi-a">Answer: ${escapeHtml(w.correctAnswer)}</div>
          <div style="color:var(--text-muted);font-size:13px;margin-top:4px;">${escapeHtml(w.explain)}</div>`;
      }
      return `<div class="wrong-item"><div class="wi-q">${i + 1}. ${escapeHtml(w.question)}</div>${body}</div>`;
    }).join('');
    wl.innerHTML = `<h3>Review These (${state.wrongAnswers.length}):</h3>${items}`;
  }
}

// ── Practice Wrong Answers ──

function practiceWrongAnswers() {
  if (state.wrongAnswers.length === 0) return;

  const practiceQs = state.wrongAnswers
    .map(w => findQuestionInData(w.question))
    .filter(Boolean);

  if (practiceQs.length === 0) return;

  state.isPracticeMode = true;
  state.isReviewMode = false;
  state.isHardMode = false;
  state.hardScore = 0;
  state.openMarksAwarded = 0;
  state.openMarksMax = 0;
  state.currentQuestions = shuffle(practiceQs);
  state.currentIndex = 0;
  state.score = 0;
  state.wrongAnswers = [];
  state.answered = false;

  showScreen('quizScreen');
  $('topicTitle').textContent = 'Practice Wrong Answers';
  $('timerBar').style.display = 'none';
  $('timerText').style.display = 'none';
  $('hardScoreDisplay').style.display = 'none';
  $('scoreDisplay').style.display = 'block';
  showQuestion();
}

// ── Review Mode from Dashboard ──

function startReviewMode() {
  const items = QuizStorage.getRandomWrongBankItems(CONFIG.REVIEW_BATCH_SIZE);
  if (items.length === 0) return;

  const reviewQs = items
    .map(item => findQuestionInData(item.q))
    .filter(Boolean);
  if (reviewQs.length === 0) return;

  state.isReviewMode = true;
  state.isPracticeMode = false;
  state.isHardMode = false;
  state.hardScore = 0;
  state.openMarksAwarded = 0;
  state.openMarksMax = 0;
  state.currentSubject = 'review';
  state.currentTheme = 'review';
  state.currentTopic = 'review';
  state.currentQuestions = shuffle(reviewQs);
  state.currentIndex = 0;
  state.score = 0;
  state.wrongAnswers = [];
  state.answered = false;

  showScreen('quizScreen');
  $('topicTitle').textContent = 'Review Wrong Answers';
  $('timerBar').style.display = 'none';
  $('timerText').style.display = 'none';
  $('hardScoreDisplay').style.display = 'none';
  $('scoreDisplay').style.display = 'block';
  showQuestion();
}

// ── Find question in loaded data ──

function findQuestionInData(questionText) {
  for (const themeId in window.QUIZ_DATA) {
    const themeData = window.QUIZ_DATA[themeId];
    for (const cat in themeData) {
      const found = themeData[cat].find(qq => qq.q === questionText);
      if (found) return found;
    }
  }
  return null;
}

// ── Progress Dashboard ──

function showProgress() {
  showScreen('progressScreen');
  const data = QuizStorage.getData();
  const subjectStats = QuizStorage.getSubjectStats();
  const dailyCounts = QuizStorage.getDailyCounts(data);
  const levelTitle = QuizStorage.getLevelTitle(data.level);
  const nextXp = QuizStorage.xpForLevel(data.level + 1);

  // Streak dots (last 7 days)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const streakDots = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);
    const dayCount = dailyCounts[dateStr] || 0;
    const isActive = dayCount > 0;
    const dayLabel = dayNames[date.getDay()];
    streakDots.push(`<div class="streak-dot ${isActive ? 'active' : 'inactive'}" title="${dateStr}: ${dayCount} questions">${dayLabel.charAt(0)}</div>`);
  }
  const streakDotsHtml = `<div style="margin-top:12px;">
    <div style="font-size:13px;color:var(--text-muted);margin-bottom:6px;">Last 7 Days</div>
    <div class="streak-dots">${streakDots.join('')}</div>
  </div>`;

  $('progressOverall').innerHTML = `
    <div class="stat-row">
      <div class="stat-box">
        <div class="stat-value">${data.xp}</div>
        <div class="stat-label">Total XP</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${data.level}</div>
        <div class="stat-label">${levelTitle}</div>
        <div class="stat-sub">${data.xp} / ${nextXp} XP</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${data.streak || 0}</div>
        <div class="stat-label">Day Streak</div>
      </div>
    </div>
    ${streakDotsHtml}`;

  // Per-subject breakdown
  let html = '';
  for (const subId in QuizLoader.subjects) {
    const sub = QuizLoader.subjects[subId];
    const stats = subjectStats[subId];
    const themes = QuizLoader.getThemesForSubject(subId);

    let subjectAnswered = 0;
    let subjectAccuracy = 0;
    if (stats) {
      subjectAnswered = stats.totalAttempts;
      let scoreCount = 0, scoreSum = 0;
      for (const sk in stats.bestScores) {
        scoreSum += stats.bestScores[sk];
        scoreCount++;
      }
      subjectAccuracy = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0;
    }

    html += `<div class="progress-subject-card">
      <div class="progress-subject-header">
        <div class="subject-icon" aria-hidden="true">${sub.icon}</div>
        <div class="subject-name" style="color:${sub.color}">${sub.name}</div>
        <div class="progress-subject-meta">${stats ? `${subjectAnswered} attempts &middot; ${subjectAccuracy}% avg` : 'Not started'}</div>
      </div>`;

    themes.forEach(theme => {
      if (!theme.loaded) return;
      const totalQsInTheme = theme.questionCount;
      const themeStats = stats && stats.themes[theme.id];
      const attempted = themeStats ? themeStats.attempted : 0;
      const attemptPct = totalQsInTheme > 0 ? Math.min(100, Math.round((attempted / totalQsInTheme) * 100)) : 0;

      html += `<div class="progress-theme-row">
        <div class="progress-theme-label">
          <span class="theme-name">${theme.name}</span>
          <span class="theme-stat">${attempted} / ${totalQsInTheme} attempted</span>
        </div>
        <div class="progress-theme-bar"><div class="progress-theme-fill" style="width:${attemptPct}%;background:${sub.color}"></div></div>`;

      if (themeStats && themeStats.bestScores) {
        const catNames = QuizLoader.getCategoryNames(theme.id);
        const scoreItems = [];
        for (const topicKey in themeStats.bestScores) {
          const topicName = catNames[topicKey] || topicKey;
          scoreItems.push(`<div class="progress-best-item">
            <span class="progress-best-name">${topicName}</span>
            <span class="progress-best-score">${themeStats.bestScores[topicKey]}%</span>
          </div>`);
        }
        if (scoreItems.length > 0) {
          html += `<div class="progress-best-scores">${scoreItems.join('')}</div>`;
        }
      }
      html += '</div>';
    });

    html += '</div>';
  }
  $('progressSubjects').innerHTML = html;
}

// ── Navigation ──

function goDashboard() {
  clearTimers();
  removeOpenQuestionUI();
  renderDashboard();
}

function goHome() {
  clearTimers();
  removeOpenQuestionUI();
  selectTheme(state.currentTheme);
}

function goThemes() {
  clearTimers();
  removeOpenQuestionUI();
  selectSubject(state.currentSubject);
}

// ── Dark Mode ──

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = $('themeToggle');
  if (btn) {
    btn.innerHTML = theme === 'dark' ? '&#9788;' : '&#9790;';
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
}

function toggleDarkMode() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem('natsquiz-theme', next); } catch (e) {}
}

function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem('natsquiz-theme'); } catch (e) {}
  if (!saved && window.matchMedia) {
    const prefers = window.matchMedia('(prefers-color-scheme: dark)');
    saved = prefers.matches ? 'dark' : 'light';
  }
  applyTheme(saved || 'light');
}

// ── Keyboard shortcuts ──
// On quiz screen, allow 1-4 (or A-D) to pick options.
function handleKeyboardShortcut(e) {
  const quizVisible = $('quizScreen').style.display === 'block';
  if (!quizVisible || state.answered) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;

  let position = -1;
  if (e.key >= '1' && e.key <= '4') position = parseInt(e.key, 10) - 1;
  else {
    const upper = e.key.toUpperCase();
    if (upper >= 'A' && upper <= 'D') position = upper.charCodeAt(0) - 'A'.charCodeAt(0);
  }
  if (position < 0) return;

  const items = document.querySelectorAll('#optionsList li');
  if (position >= items.length) return;
  e.preventDefault();
  const li = items[position];
  const origIdx = parseInt(li.dataset.idx, 10);
  pickAnswer(li, origIdx);
}

// ── Wire up static event listeners ──

function wireEvents() {
  $('themeToggle').addEventListener('click', toggleDarkMode);
  $('backToDashboard').addEventListener('click', goDashboard);
  $('backToThemes').addEventListener('click', goThemes);
  $('backToTopics').addEventListener('click', goHome);
  $('backFromProgress').addEventListener('click', goDashboard);
  $('practiceWrongBtn').addEventListener('click', practiceWrongAnswers);
  $('tryAgainBtn').addEventListener('click', () => startQuiz(state.lastTopic));
  $('pickAnotherBtn').addEventListener('click', goHome);
  $('resultsHomeBtn').addEventListener('click', goDashboard);
  document.addEventListener('keydown', handleKeyboardShortcut);
}

// ── Expose to global (for back-compat & debugging) ──

window.QuizApp = {
  startQuiz, goHome, goThemes, goDashboard,
  renderDashboard, toggleDarkMode,
  practiceWrongAnswers, startReviewMode, showProgress,
};

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  wireEvents();
  renderDashboard();
});

})();
