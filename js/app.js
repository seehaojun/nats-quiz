// Nat's Quiz — P4 Quiz Engine with motivation system
(function() {

var currentSubject = '';
var currentTheme = '';
var currentTopic = '';
var currentQuestions = [];
var currentIndex = 0;
var score = 0;
var answered = false;
var wrongAnswers = [];
var isHardMode = false;
var hardScore = 0;
var timerInterval = null;
var timerStart = 0;
var autoAdvanceTimer = null;
var HARD_TIME_LIMIT = 30;
var AUTO_ADVANCE_DELAY = 1000;
var isPracticeMode = false;
var isReviewMode = false;

// Open-ended question state
var openMarksAwarded = 0;
var openMarksMax = 0;
// Same-origin: the grader is deployed alongside the static site on Vercel.
// localStorage override is still useful for opening index.html via file://
// (where relative URLs can't resolve) or pointing at a staging deployment.
var DEFAULT_GRADER_URL = '/api/grade';
function getGraderUrl() {
  try {
    var override = localStorage.getItem('natsquiz-grader-url');
    if (override) return override;
  } catch(e) {}
  return DEFAULT_GRADER_URL;
}

// ── Screens ──

function showScreen(id) {
  var screens = document.querySelectorAll('.screen');
  for (var i = 0; i < screens.length; i++) screens[i].style.display = 'none';
  document.getElementById(id).style.display = 'block';
}

// ── Dashboard ──

function renderDashboard() {
  showScreen('dashboardScreen');
  var data = QuizStorage.getData();

  // Stats bar
  var statsEl = document.getElementById('dashStats');
  var levelTitle = QuizStorage.getLevelTitle(data.level);
  var nextXp = QuizStorage.xpForLevel(data.level + 1);
  var currXp = QuizStorage.xpForLevel(data.level);
  var progressPct = nextXp > currXp ? Math.min(100, Math.round((data.xp - currXp) / (nextXp - currXp) * 100)) : 100;

  statsEl.innerHTML =
    '<div class="stat-row">' +
      '<div class="stat-box">' +
        '<div class="stat-value">' + data.level + '</div>' +
        '<div class="stat-label">' + levelTitle + '</div>' +
        '<div class="xp-bar"><div class="xp-fill" style="width:' + progressPct + '%"></div></div>' +
        '<div class="stat-sub">' + data.xp + ' / ' + nextXp + ' XP</div>' +
      '</div>' +
      '<div class="stat-box">' +
        '<div class="stat-value">' + (data.streak > 0 ? data.streak : '0') + '</div>' +
        '<div class="stat-label">' + (data.streak === 1 ? 'Day Streak' : 'Day Streak') + '</div>' +
        '<div class="stat-sub">' + (data.streak >= 3 ? '🔥' : '') + '</div>' +
      '</div>' +
      '<div class="stat-box">' +
        '<div class="stat-value">' + data.totalAnswered + '</div>' +
        '<div class="stat-label">Questions Done</div>' +
        '<div class="stat-sub">' + (data.totalAnswered > 0 ? Math.round(data.totalCorrect / data.totalAnswered * 100) + '% correct' : 'Start quizzing!') + '</div>' +
      '</div>' +
    '</div>';

  // Daily progress
  var dailyEl = document.getElementById('dailyProgress');
  var dailyDone = QuizStorage.getDailyProgress(data);
  var dailyTarget = data.dailyTarget;
  var dailyPct = Math.min(100, Math.round(dailyDone / dailyTarget * 100));
  dailyEl.innerHTML =
    '<div class="daily-bar-label">' +
      '<span>Today\'s Goal: ' + dailyDone + ' / ' + dailyTarget + ' questions</span>' +
      (dailyDone >= dailyTarget ? '<span class="daily-done">Done!</span>' : '') +
    '</div>' +
    '<div class="daily-bar"><div class="daily-fill" style="width:' + dailyPct + '%"></div></div>';

  // Dashboard action buttons
  var actionsEl = document.getElementById('dashboardActions');
  var actionsHtml = '';
  var wrongBankCount = (data.wrongBank || []).length;
  if (wrongBankCount > 0) {
    actionsHtml += '<button class="dash-action-btn review-btn" onclick="QuizApp.startReviewMode()">' +
      'Review Wrong Answers <span class="review-count">' + wrongBankCount + '</span></button>';
  }
  actionsHtml += '<button class="dash-action-btn progress-btn" onclick="QuizApp.showProgress()">Progress</button>';
  actionsEl.innerHTML = actionsHtml;

  // Subject grid
  var grid = document.getElementById('subjectGrid');
  grid.innerHTML = '';
  var subjects = QuizLoader.subjects;
  for (var id in subjects) {
    if (!subjects.hasOwnProperty(id)) continue;
    var s = subjects[id];
    var count = QuizLoader.getSubjectQuestionCount(id);
    var themes = QuizLoader.getThemesForSubject(id);
    var hasContent = themes.some(function(t) { return t.loaded; });

    var card = document.createElement('div');
    card.className = 'subject-card' + (hasContent ? '' : ' disabled');
    card.style.borderColor = s.color;
    if (hasContent) {
      card.onclick = (function(sid) { return function() { selectSubject(sid); }; })(id);
    }
    card.innerHTML =
      '<div class="subject-icon">' + s.icon + '</div>' +
      '<div class="subject-name" style="color:' + s.color + '">' + s.name + '</div>' +
      '<div class="subject-count">' + (hasContent ? count + ' questions' : 'Coming soon') + '</div>';
    grid.appendChild(card);
  }

  // Badges
  renderBadges(data);
}

function renderBadges(data) {
  var section = document.getElementById('badgesSection');
  var earned = data.badges || [];
  if (earned.length === 0 && data.totalAnswered === 0) {
    section.innerHTML = '';
    return;
  }

  var html = '<h2 class="section-title">Badges</h2><div class="badge-grid">';
  QuizStorage.BADGE_DEFS.forEach(function(b) {
    var has = earned.indexOf(b.id) !== -1;
    html += '<div class="badge-item' + (has ? ' earned' : '') + '" title="' + b.desc + '">' +
      '<div class="badge-icon">' + (has ? b.icon : '🔒') + '</div>' +
      '<div class="badge-name">' + b.name + '</div>' +
    '</div>';
  });
  html += '</div>';
  section.innerHTML = html;
}

// ── Subject Selection ──

function selectSubject(subjectId) {
  currentSubject = subjectId;
  showScreen('themeScreen');
  var s = QuizLoader.subjects[subjectId];
  document.getElementById('themeScreenTitle').textContent = s.name;
  document.getElementById('themeScreenDesc').textContent = s.desc + ' — Pick a theme';
  renderThemeScreen();
}

// ── Theme Selection ──

function renderThemeScreen() {
  var themes = QuizLoader.getThemesForSubject(currentSubject);
  var grid = document.getElementById('themeGrid');
  grid.innerHTML = '';
  var data = QuizStorage.getData();

  themes.forEach(function(t) {
    var card = document.createElement('div');
    card.className = 'theme-card ' + t.color + (t.loaded ? '' : ' disabled');
    card.onclick = t.loaded ? function() { selectTheme(t.id); } : null;

    // Best score for this theme
    var bestHtml = '';
    var themeScoreKey = currentSubject + '/' + t.id;
    for (var key in data.scores) {
      if (key.startsWith(themeScoreKey)) {
        var s = data.scores[key];
        if (s.best > 0) {
          bestHtml = '<div class="theme-best">Best: ' + s.best + '%</div>';
          break;
        }
      }
    }

    card.innerHTML = '<div class="theme-icon">' + t.icon + '</div>' +
      '<div class="theme-name">' + t.name + '</div>' +
      '<div class="theme-count">' + (t.loaded ? t.questionCount + ' questions' : 'Coming soon') + '</div>' +
      bestHtml;
    grid.appendChild(card);
  });
}

function selectTheme(themeId) {
  currentTheme = themeId;
  var data = QuizLoader.getThemeData(themeId);
  var names = QuizLoader.getCategoryNames(themeId);
  var info = QuizLoader.themes[themeId];

  showScreen('homeScreen');
  document.getElementById('homeTitle').textContent = info.name;
  document.getElementById('homeSubtitle').textContent = info.description;

  var container = document.getElementById('topicButtons');
  container.innerHTML = '';

  var regularCats = [];
  var timedCats = [];
  var allCount = 0;
  var storageData = QuizStorage.getData();

  for (var key in data) {
    if (!data.hasOwnProperty(key)) continue;
    if (key === 'hard' || key === 'compare') {
      timedCats.push(key);
    } else {
      regularCats.push(key);
      allCount += data[key].length;
    }
  }

  regularCats.forEach(function(cat) {
    var btn = document.createElement('button');
    btn.className = 'topic-btn';
    if (cat === 'notqs') btn.style.cssText = 'border-color:#f6ad55;color:#c05621;';
    if (cat === 'plantsys') btn.style.cssText = 'border-color:#9ae6b4;color:#276749;';
    if (cat === 'apply') btn.style.cssText = 'border-color:#d6bcfa;color:#553c9a;';

    var scoreKey = currentSubject + '/' + currentTheme + '/' + cat;
    var bestInfo = storageData.scores[scoreKey];
    var bestHtml = bestInfo && bestInfo.best > 0 ? ' <span class="topic-best">Best: ' + bestInfo.best + '%</span>' : '';

    btn.innerHTML = (names[cat] || cat) + bestHtml + ' <div class="count">' + data[cat].length + ' questions</div>';
    btn.onclick = function() { startQuiz(cat); };
    container.appendChild(btn);
  });

  timedCats.forEach(function(cat) {
    var btn = document.createElement('button');
    btn.className = 'topic-btn ' + (cat === 'compare' ? 'compare-btn' : 'hard-btn');
    btn.innerHTML = (names[cat] || cat) + ' (Timed Challenge) <div class="count" style="color:' +
      (cat === 'compare' ? '#ffe0b2' : '#fcc') + '">' + data[cat].length + ' questions — timed!</div>';
    btn.onclick = function() { startQuiz(cat); };
    container.appendChild(btn);
  });

  var allBtn = document.createElement('button');
  allBtn.className = 'topic-btn all-btn';
  allBtn.innerHTML = 'ALL QUESTIONS <div class="count" style="color:#ccc">' + allCount + ' questions</div>';
  allBtn.onclick = function() { startQuiz('all'); };
  container.appendChild(allBtn);
}

// ── Quiz Engine ──

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function startQuiz(topic) {
  var data = QuizLoader.getThemeData(currentTheme);
  currentTopic = topic;
  isHardMode = (topic === 'hard' || topic === 'compare');
  isPracticeMode = false;
  isReviewMode = false;
  hardScore = 0;
  openMarksAwarded = 0;
  openMarksMax = 0;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }

  if (topic === 'all') {
    var allQs = [];
    for (var key in data) {
      if (data.hasOwnProperty(key) && key !== 'hard' && key !== 'compare') {
        allQs = allQs.concat(data[key]);
      }
    }
    currentQuestions = shuffle(allQs);
    document.getElementById('topicTitle').textContent = 'All Questions';
  } else {
    currentQuestions = shuffle(data[topic].slice());
    var names = QuizLoader.getCategoryNames(currentTheme);
    document.getElementById('topicTitle').textContent = names[topic] || topic;
  }

  // Open-ended questions never enter timed mode — they need think time.
  if (isHardMode) {
    currentQuestions = currentQuestions.filter(function(q) { return q.type !== 'open'; });
  }

  window._lastTopic = topic;
  currentIndex = 0; score = 0; wrongAnswers = []; answered = false;
  showScreen('quizScreen');
  document.getElementById('timerBar').style.display = isHardMode ? 'block' : 'none';
  document.getElementById('timerText').style.display = isHardMode ? 'block' : 'none';
  document.getElementById('hardScoreDisplay').style.display = isHardMode ? 'block' : 'none';
  document.getElementById('scoreDisplay').style.display = isHardMode ? 'none' : 'block';
  showQuestion();
}

function showQuestion() {
  answered = false;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
  var q = currentQuestions[currentIndex];
  var qNumText = 'Question ' + (currentIndex + 1) + ' of ' + currentQuestions.length;
  var qNumEl = document.getElementById('qNumber');
  qNumEl.textContent = qNumText;
  if (isPracticeMode) {
    qNumEl.innerHTML = qNumText + ' <span class="mode-label practice">Practice Mode</span>';
  } else if (isReviewMode) {
    qNumEl.innerHTML = qNumText + ' <span class="mode-label review">Review Mode</span>';
  }
  document.getElementById('qText').textContent = q.q;
  document.getElementById('scoreDisplay').textContent = formatScore(score) + ' / ' + currentQuestions.length;
  document.getElementById('progressFill').style.width = (currentIndex / currentQuestions.length * 100) + '%';

  // Always tear down any open-Q UI from the previous question.
  removeOpenQuestionUI();

  if (q.type === 'open') {
    showOpenQuestion(q);
    return;
  }

  // MCQ rendering
  document.getElementById('optionsList').style.display = '';
  var indices = q.opts.map(function(_, i) { return i; });
  var shuffled = shuffle(indices);
  var list = document.getElementById('optionsList');
  list.innerHTML = '';
  shuffled.forEach(function(i) {
    var li = document.createElement('li');
    li.textContent = q.opts[i];
    li.dataset.idx = i;
    li.onclick = function() { pickAnswer(li, i); };
    list.appendChild(li);
  });

  document.getElementById('explanation').style.display = 'none';
  document.getElementById('timeBonus').style.display = 'none';

  if (isHardMode) {
    document.getElementById('hardScoreDisplay').innerHTML = 'Points: <span class="pts">' + hardScore.toFixed(2) + '</span>';
    timerStart = Date.now();
    var fill = document.getElementById('timerFill');
    var text = document.getElementById('timerText');
    fill.style.width = '100%';
    fill.className = 'timer-fill';
    text.className = 'timer-text';
    text.textContent = HARD_TIME_LIMIT + 's';
    timerInterval = setInterval(function() {
      var elapsed = (Date.now() - timerStart) / 1000;
      var remaining = Math.max(0, HARD_TIME_LIMIT - elapsed);
      var pct = (remaining / HARD_TIME_LIMIT) * 100;
      fill.style.width = pct + '%';
      text.textContent = remaining.toFixed(1) + 's';
      if (remaining <= 5) { fill.className = 'timer-fill danger'; text.className = 'timer-text danger'; }
      else if (remaining <= 10) { fill.className = 'timer-fill warn'; text.className = 'timer-text warn'; }
      if (remaining <= 0) {
        clearInterval(timerInterval); timerInterval = null;
        hardTimeUp();
      }
    }, 100);
  }
}

function hardTimeUp() {
  if (answered) return;
  answered = true;
  var q = currentQuestions[currentIndex];
  hardScore -= 0.25;
  document.querySelectorAll('#optionsList li').forEach(function(li) {
    li.classList.add('disabled');
    if (parseInt(li.dataset.idx) === q.ans) li.classList.add('correct');
  });
  wrongAnswers.push({ question: q.q, yourAnswer: "(Time's up!)", correctAnswer: q.opts[q.ans], explain: q.explain });
  document.getElementById('hardScoreDisplay').innerHTML = 'Points: <span class="pts">' + hardScore.toFixed(2) + '</span>';
  document.getElementById('explanation').textContent = q.explain;
  document.getElementById('explanation').style.display = 'block';
  var tb = document.getElementById('timeBonus');
  tb.textContent = "Time's up! -0.25 pts";
  tb.className = 'time-bonus penalty';
  tb.style.display = 'block';
  autoAdvanceTimer = setTimeout(function() { nextQuestion(); }, AUTO_ADVANCE_DELAY);
}

// ── Open-ended questions ──

function formatScore(s) {
  return Math.abs(s - Math.round(s)) < 0.001 ? String(Math.round(s)) : s.toFixed(1);
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, function(c) {
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
  });
}

function removeOpenQuestionUI() {
  var existing = document.getElementById('openQuestionBox');
  if (existing) existing.parentNode.removeChild(existing);
  var existingNext = document.getElementById('openNextBtn');
  if (existingNext) existingNext.parentNode.removeChild(existingNext);
}

function showOpenQuestion(q) {
  // Hide MCQ-specific UI
  document.getElementById('optionsList').style.display = 'none';
  document.getElementById('explanation').style.display = 'none';
  document.getElementById('timeBonus').style.display = 'none';

  var card = document.querySelector('#quizScreen .question-card');
  var box = document.createElement('div');
  box.id = 'openQuestionBox';
  box.className = 'open-box';
  var maxMarks = q.max_marks || 3;
  box.innerHTML =
    '<div class="open-marks-label">Open-Ended &middot; ' + maxMarks + ' mark' + (maxMarks === 1 ? '' : 's') + '</div>' +
    '<textarea id="openAnswer" class="open-textarea" placeholder="Type your answer in your own words..." maxlength="2000"></textarea>' +
    '<div class="open-actions">' +
      '<button id="openSubmit" class="open-submit-btn" type="button">Check My Answer</button>' +
    '</div>' +
    '<div id="openFeedback" class="open-feedback" style="display:none"></div>';
  card.appendChild(box);

  document.getElementById('openSubmit').onclick = submitOpenAnswer;
  setTimeout(function() {
    var ta = document.getElementById('openAnswer');
    if (ta) ta.focus();
  }, 50);
}

function submitOpenAnswer() {
  if (answered) return;
  var q = currentQuestions[currentIndex];
  var ta = document.getElementById('openAnswer');
  var btn = document.getElementById('openSubmit');
  var feedback = document.getElementById('openFeedback');
  var studentAnswer = (ta.value || '').trim();
  if (!studentAnswer) {
    ta.classList.add('open-textarea-error');
    setTimeout(function() { ta.classList.remove('open-textarea-error'); }, 600);
    return;
  }
  answered = true;
  ta.disabled = true;
  btn.disabled = true;
  btn.textContent = 'Asking Claude...';
  feedback.style.display = 'block';
  feedback.className = 'open-feedback open-feedback-loading';
  feedback.innerHTML = '<span class="open-spinner"></span> Asking Claude to grade your answer...';

  var maxMarks = q.max_marks || 3;
  var payload = {
    question: q.q,
    model_answer: q.model_answer || '',
    rubric: q.rubric || '',
    max_marks: maxMarks,
    student_answer: studentAnswer
  };

  fetch(getGraderUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(function(r) {
      if (!r.ok) throw new Error('grader_http_' + r.status);
      return r.json();
    })
    .then(function(data) {
      if (data && data.error) throw new Error(data.error);
      var max = (typeof data.max === 'number') ? data.max : maxMarks;
      var rawScore = (typeof data.score === 'number') ? data.score : 0;
      var awardedScore = Math.max(0, Math.min(max, rawScore));
      renderOpenFeedback(q, studentAnswer, awardedScore, max, data, /*isFallback*/ false);
      recordOpenResult(q, studentAnswer, awardedScore, max, data);
    })
    .catch(function(err) {
      // Graceful offline fallback: show model answer and let user self-grade.
      renderOpenFallback(q, studentAnswer, err);
    });
}

function renderOpenFeedback(q, studentAnswer, awardedScore, max, data, isFallback) {
  var feedback = document.getElementById('openFeedback');
  feedback.className = 'open-feedback';
  var pct = max > 0 ? (awardedScore / max) : 0;
  var scoreClass = pct >= 0.85 ? 'open-score-good' : (pct >= 0.5 ? 'open-score-partial' : 'open-score-low');
  var html =
    '<div class="open-score ' + scoreClass + '">Score: ' + formatScore(awardedScore) + ' / ' + max + '</div>';
  if (data && data.what_went_well) {
    html += '<div class="feedback-row feedback-good">' +
      '<div class="feedback-label">What went well</div>' +
      '<div class="feedback-body">' + escapeHtml(data.what_went_well) + '</div></div>';
  }
  if (data && data.what_was_missing) {
    html += '<div class="feedback-row feedback-missing">' +
      '<div class="feedback-label">What was missing</div>' +
      '<div class="feedback-body">' + escapeHtml(data.what_was_missing) + '</div></div>';
  }
  if (data && data.suggested_phrasing) {
    html += '<div class="feedback-row feedback-suggest">' +
      '<div class="feedback-label">A model answer</div>' +
      '<div class="feedback-body">' + escapeHtml(data.suggested_phrasing) + '</div></div>';
  } else if (q.model_answer) {
    html += '<div class="feedback-row feedback-suggest">' +
      '<div class="feedback-label">A model answer</div>' +
      '<div class="feedback-body">' + escapeHtml(q.model_answer) + '</div></div>';
  }
  feedback.innerHTML = html;
  appendOpenNextButton();
}

function renderOpenFallback(q, studentAnswer, err) {
  var feedback = document.getElementById('openFeedback');
  feedback.className = 'open-feedback open-feedback-fallback';
  var maxMarks = q.max_marks || 3;
  feedback.innerHTML =
    '<div class="feedback-row feedback-missing">' +
      '<div class="feedback-label">Couldn\'t reach the grader</div>' +
      '<div class="feedback-body">No internet, or the grader isn\'t deployed yet. Compare your answer with the model answer below and self-grade.</div>' +
    '</div>' +
    '<div class="feedback-row feedback-suggest">' +
      '<div class="feedback-label">Model answer</div>' +
      '<div class="feedback-body">' + escapeHtml(q.model_answer || '(no model answer provided)') + '</div>' +
    '</div>' +
    '<div class="open-self-grade">' +
      '<div class="open-self-grade-label">How did you do?</div>' +
      '<button type="button" class="self-grade-btn self-grade-full" data-marks="' + maxMarks + '">Got it right (' + maxMarks + '/' + maxMarks + ')</button>' +
      (maxMarks >= 2 ? '<button type="button" class="self-grade-btn self-grade-partial" data-marks="' + Math.ceil(maxMarks / 2) + '">Partly right (' + Math.ceil(maxMarks / 2) + '/' + maxMarks + ')</button>' : '') +
      '<button type="button" class="self-grade-btn self-grade-none" data-marks="0">Missed it (0/' + maxMarks + ')</button>' +
    '</div>';
  var btns = feedback.querySelectorAll('.self-grade-btn');
  btns.forEach(function(b) {
    b.onclick = function() {
      var marks = parseInt(b.dataset.marks, 10) || 0;
      btns.forEach(function(x) { x.disabled = true; });
      b.classList.add('selected');
      var fakeData = {
        score: marks,
        max: maxMarks,
        what_went_well: marks === maxMarks ? 'You said you got it right — well done!' : '',
        what_was_missing: marks < maxMarks ? 'Compare your answer with the model answer above.' : '',
        suggested_phrasing: q.model_answer || ''
      };
      recordOpenResult(q, studentAnswer, marks, maxMarks, fakeData);
      appendOpenNextButton();
    };
  });
}

function recordOpenResult(q, studentAnswer, awardedScore, max, data) {
  var pct = max > 0 ? (awardedScore / max) : 0;
  // Add fractional credit toward total score.
  score += pct;
  openMarksAwarded += awardedScore;
  openMarksMax += max;
  document.getElementById('scoreDisplay').textContent = formatScore(score) + ' / ' + currentQuestions.length;

  // In review mode, remove perfectly answered questions from wrong bank.
  if (isReviewMode && pct >= 0.999) {
    QuizStorage.removeFromWrongBank(q.q);
  }

  // Push to wrong list if not perfect, with extended fields for review.
  if (pct < 0.999) {
    wrongAnswers.push({
      question: q.q,
      yourAnswer: studentAnswer,
      correctAnswer: q.model_answer || '',
      explain: (data && data.what_was_missing) ? data.what_was_missing : (q.model_answer || ''),
      type: 'open',
      studentAnswer: studentAnswer,
      modelAnswer: q.model_answer || '',
      feedback: {
        score: awardedScore,
        max: max,
        what_went_well: (data && data.what_went_well) || '',
        what_was_missing: (data && data.what_was_missing) || '',
        suggested_phrasing: (data && data.suggested_phrasing) || ''
      },
      maxMarks: max
    });
  }
}

function appendOpenNextButton() {
  if (document.getElementById('openNextBtn')) return;
  var card = document.querySelector('#quizScreen .question-card');
  var btn = document.createElement('button');
  btn.id = 'openNextBtn';
  btn.className = 'open-next-btn';
  btn.type = 'button';
  btn.textContent = (currentIndex + 1 < currentQuestions.length) ? 'Next Question →' : 'See Results →';
  btn.onclick = function() { nextQuestion(); };
  card.appendChild(btn);
  setTimeout(function() { btn.focus(); }, 50);
}

function pickAnswer(el, idx) {
  if (answered) return;
  answered = true;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  var q = currentQuestions[currentIndex];
  document.querySelectorAll('#optionsList li').forEach(function(li) {
    li.classList.add('disabled');
    if (parseInt(li.dataset.idx) === q.ans) li.classList.add('correct');
  });
  var tb = document.getElementById('timeBonus');
  if (isHardMode) {
    var elapsed = (Date.now() - timerStart) / 1000;
    var remaining = Math.max(0, HARD_TIME_LIMIT - elapsed);
    if (idx === q.ans) {
      score++;
      el.classList.add('correct');
      var timeBonus = remaining / HARD_TIME_LIMIT;
      var totalPts = 1 + timeBonus;
      hardScore += totalPts;
      tb.textContent = '+' + totalPts.toFixed(2) + ' pts (speed bonus: +' + timeBonus.toFixed(2) + ')';
      tb.className = 'time-bonus';
      tb.style.display = 'block';
    } else {
      el.classList.add('wrong');
      hardScore -= 0.25;
      wrongAnswers.push({ question: q.q, yourAnswer: q.opts[idx], correctAnswer: q.opts[q.ans], explain: q.explain });
      tb.textContent = '-0.25 pts';
      tb.className = 'time-bonus penalty';
      tb.style.display = 'block';
    }
    document.getElementById('hardScoreDisplay').innerHTML = 'Points: <span class="pts">' + hardScore.toFixed(2) + '</span>';
  } else {
    if (idx === q.ans) {
      score++; el.classList.add('correct');
      // In review mode, remove correctly answered questions from wrong bank
      if (isReviewMode) {
        QuizStorage.removeFromWrongBank(q.q);
      }
    } else {
      el.classList.add('wrong');
      wrongAnswers.push({ question: q.q, yourAnswer: q.opts[idx], correctAnswer: q.opts[q.ans], explain: q.explain });
    }
    document.getElementById('scoreDisplay').textContent = formatScore(score) + ' / ' + currentQuestions.length;
    tb.style.display = 'none';
  }
  document.getElementById('explanation').textContent = q.explain;
  document.getElementById('explanation').style.display = 'block';
  autoAdvanceTimer = setTimeout(function() { nextQuestion(); }, AUTO_ADVANCE_DELAY);
}

function nextQuestion() {
  if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
  currentIndex++;
  if (currentIndex >= currentQuestions.length) showResults();
  else showQuestion();
}

function showResults() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }

  // Record result and get XP info (skip recording for practice/review modes)
  var openMarks = openMarksMax > 0 ? { awarded: openMarksAwarded, max: openMarksMax } : null;
  var result;
  if (isPracticeMode || isReviewMode) {
    result = { xpGained: 0, newBadges: [], level: 0, streak: 0 };
  } else {
    result = QuizStorage.recordQuizResult(
      currentSubject, currentTheme, currentTopic,
      currentQuestions.length, score, wrongAnswers, openMarks
    );
  }

  showScreen('resultsScreen');
  var g = document.getElementById('gradeLabel');
  var pct;
  if (isHardMode) {
    var maxPossible = currentQuestions.length * 2;
    document.getElementById('finalScore').innerHTML = hardScore.toFixed(2) + ' <span>/ ' + maxPossible + ' pts</span>';
    pct = Math.round((score / currentQuestions.length) * 100);
  } else {
    pct = Math.round((score / currentQuestions.length) * 100);
    document.getElementById('finalScore').innerHTML = formatScore(score) + ' <span>/ ' + currentQuestions.length + ' (' + pct + '%)</span>';
  }
  if (pct >= 90) { g.textContent = 'Excellent!'; g.className = 'grade gold'; }
  else if (pct >= 70) { g.textContent = 'Good Job!'; g.className = 'grade silver'; }
  else if (pct >= 50) { g.textContent = 'Keep Trying!'; g.className = 'grade bronze'; }
  else { g.textContent = 'Study More & Try Again!'; g.className = 'grade try'; }

  // XP display
  var xpEl = document.getElementById('xpGained');
  if (isPracticeMode || isReviewMode) {
    xpEl.innerHTML = (isPracticeMode ? 'Practice Mode' : 'Review Mode') + ' — no XP awarded';
    xpEl.style.display = 'block';
  } else {
    xpEl.innerHTML = '+' + result.xpGained + ' XP' +
      (result.streak > 1 ? ' &middot; ' + result.streak + '-day streak 🔥' : '');
    xpEl.style.display = 'block';
  }

  // New badges
  var nbEl = document.getElementById('newBadges');
  if (result.newBadges.length > 0) {
    var badgeHtml = '<div class="new-badge-label">New Badge!</div>';
    result.newBadges.forEach(function(bid) {
      var def = QuizStorage.BADGE_DEFS.find(function(b) { return b.id === bid; });
      if (def) {
        badgeHtml += '<div class="new-badge">' + def.icon + ' ' + def.name + '</div>';
      }
    });
    nbEl.innerHTML = badgeHtml;
    nbEl.style.display = 'block';
  } else {
    nbEl.style.display = 'none';
  }

  // Practice wrong answers button
  var practiceBtn = document.getElementById('practiceWrongBtn');
  if (practiceBtn) {
    practiceBtn.style.display = (wrongAnswers.length > 0 && !isPracticeMode) ? 'inline-block' : 'none';
  }

  var wl = document.getElementById('wrongList');
  if (wrongAnswers.length === 0) {
    wl.innerHTML = '<p style="color:#38a169;font-weight:600;margin-top:12px;">Perfect! Every answer correct!</p>';
  } else {
    var h = '<h3>Review These (' + wrongAnswers.length + '):</h3>';
    wrongAnswers.forEach(function(w, i) {
      h += '<div class="wrong-item"><div class="wi-q">' + (i + 1) + '. ' + escapeHtml(w.question) + '</div>';
      if (w.type === 'open') {
        var fb = w.feedback || {};
        h += '<div class="wi-open-score">Score: ' + formatScore(fb.score || 0) + ' / ' + (fb.max || w.maxMarks || 0) + '</div>';
        h += '<div class="wi-open-row"><span class="wi-open-label">Your answer:</span> ' + escapeHtml(w.studentAnswer || '') + '</div>';
        if (fb.what_went_well) h += '<div class="wi-open-row wi-open-good"><span class="wi-open-label">What went well:</span> ' + escapeHtml(fb.what_went_well) + '</div>';
        if (fb.what_was_missing) h += '<div class="wi-open-row wi-open-missing"><span class="wi-open-label">What was missing:</span> ' + escapeHtml(fb.what_was_missing) + '</div>';
        if (w.modelAnswer) h += '<div class="wi-a">Model answer: ' + escapeHtml(w.modelAnswer) + '</div>';
      } else {
        h += '<div style="color:#e53e3e;">You picked: ' + escapeHtml(w.yourAnswer) + '</div>';
        h += '<div class="wi-a">Answer: ' + escapeHtml(w.correctAnswer) + '</div>';
        h += '<div style="color:#666;font-size:13px;margin-top:4px;">' + escapeHtml(w.explain) + '</div>';
      }
      h += '</div>';
    });
    wl.innerHTML = h;
  }
}

// ── Practice Wrong Answers ──

function practiceWrongAnswers() {
  if (wrongAnswers.length === 0) return;

  // Build question objects from the wrongAnswers of the just-completed quiz
  var practiceQs = [];
  wrongAnswers.forEach(function(w) {
    var found = findQuestionInData(w.question);
    if (found) {
      practiceQs.push(found);
    }
  });

  if (practiceQs.length === 0) return;

  isPracticeMode = true;
  isReviewMode = false;
  isHardMode = false;
  hardScore = 0;
  currentQuestions = shuffle(practiceQs);
  currentIndex = 0; score = 0; wrongAnswers = []; answered = false;

  showScreen('quizScreen');
  document.getElementById('topicTitle').textContent = 'Practice Wrong Answers';
  document.getElementById('timerBar').style.display = 'none';
  document.getElementById('timerText').style.display = 'none';
  document.getElementById('hardScoreDisplay').style.display = 'none';
  document.getElementById('scoreDisplay').style.display = 'block';
  showQuestion();
}

// ── Review Mode from Dashboard ──

function startReviewMode() {
  var items = QuizStorage.getRandomWrongBankItems(20);
  if (items.length === 0) return;

  // Reconstruct question objects from wrong bank entries
  var reviewQs = [];
  items.forEach(function(item) {
    var found = findQuestionInData(item.q);
    if (found) {
      reviewQs.push(found);
    }
  });

  if (reviewQs.length === 0) return;

  isReviewMode = true;
  isPracticeMode = false;
  isHardMode = false;
  hardScore = 0;
  currentSubject = 'review';
  currentTheme = 'review';
  currentTopic = 'review';
  currentQuestions = shuffle(reviewQs);
  currentIndex = 0; score = 0; wrongAnswers = []; answered = false;

  showScreen('quizScreen');
  document.getElementById('topicTitle').textContent = 'Review Wrong Answers';
  document.getElementById('timerBar').style.display = 'none';
  document.getElementById('timerText').style.display = 'none';
  document.getElementById('hardScoreDisplay').style.display = 'none';
  document.getElementById('scoreDisplay').style.display = 'block';
  showQuestion();
}

// ── Find question in loaded data ──

function findQuestionInData(questionText) {
  for (var themeId in window.QUIZ_DATA) {
    if (!window.QUIZ_DATA.hasOwnProperty(themeId)) continue;
    var themeData = window.QUIZ_DATA[themeId];
    for (var cat in themeData) {
      if (!themeData.hasOwnProperty(cat)) continue;
      var questions = themeData[cat];
      for (var i = 0; i < questions.length; i++) {
        if (questions[i].q === questionText) {
          return questions[i];
        }
      }
    }
  }
  return null;
}

// ── Progress Dashboard ──

function showProgress() {
  showScreen('progressScreen');
  var data = QuizStorage.getData();
  var subjectStats = QuizStorage.getSubjectStats();
  var dailyCounts = QuizStorage.getDailyCounts(data);

  // Overall stats
  var overallEl = document.getElementById('progressOverall');
  var levelTitle = QuizStorage.getLevelTitle(data.level);
  var nextXp = QuizStorage.xpForLevel(data.level + 1);

  // Streak dots (last 7 days)
  var streakDotsHtml = '<div style="margin-top:12px;"><div style="font-size:13px;color:var(--text-muted);margin-bottom:6px;">Last 7 Days</div><div class="streak-dots">';
  var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (var d = 6; d >= 0; d--) {
    var date = new Date();
    date.setDate(date.getDate() - d);
    var dateStr = date.toISOString().slice(0, 10);
    var dayCount = dailyCounts[dateStr] || 0;
    var isActive = dayCount > 0;
    var dayLabel = dayNames[date.getDay()];
    streakDotsHtml += '<div class="streak-dot ' + (isActive ? 'active' : 'inactive') + '" title="' + dateStr + ': ' + dayCount + ' questions">' + dayLabel.charAt(0) + '</div>';
  }
  streakDotsHtml += '</div></div>';

  overallEl.innerHTML =
    '<div class="stat-row">' +
      '<div class="stat-box">' +
        '<div class="stat-value">' + data.xp + '</div>' +
        '<div class="stat-label">Total XP</div>' +
      '</div>' +
      '<div class="stat-box">' +
        '<div class="stat-value">' + data.level + '</div>' +
        '<div class="stat-label">' + levelTitle + '</div>' +
        '<div class="stat-sub">' + data.xp + ' / ' + nextXp + ' XP</div>' +
      '</div>' +
      '<div class="stat-box">' +
        '<div class="stat-value">' + (data.streak || 0) + '</div>' +
        '<div class="stat-label">Day Streak</div>' +
      '</div>' +
    '</div>' +
    streakDotsHtml;

  // Per-subject breakdown
  var subjectsEl = document.getElementById('progressSubjects');
  var html = '';
  var subjects = QuizLoader.subjects;

  for (var subId in subjects) {
    if (!subjects.hasOwnProperty(subId)) continue;
    var sub = subjects[subId];
    var stats = subjectStats[subId];
    var themes = QuizLoader.getThemesForSubject(subId);
    var hasAnyData = !!stats;

    // Calculate subject-level stats
    var subjectAnswered = 0;
    var subjectAccuracy = 0;
    if (stats) {
      // Count total attempts across all themes/topics
      subjectAnswered = stats.totalAttempts;
      // Calculate accuracy from best scores
      var scoreCount = 0;
      var scoreSum = 0;
      for (var sk in stats.bestScores) {
        if (stats.bestScores.hasOwnProperty(sk)) {
          scoreSum += stats.bestScores[sk];
          scoreCount++;
        }
      }
      subjectAccuracy = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0;
    }

    html += '<div class="progress-subject-card">';
    html += '<div class="progress-subject-header">' +
      '<div class="subject-icon">' + sub.icon + '</div>' +
      '<div class="subject-name" style="color:' + sub.color + '">' + sub.name + '</div>' +
      '<div class="progress-subject-meta">' +
        (hasAnyData ? subjectAnswered + ' attempts &middot; ' + subjectAccuracy + '% avg' : 'Not started') +
      '</div></div>';

    // Per-theme progress bars
    themes.forEach(function(theme) {
      if (!theme.loaded) return;
      var totalQsInTheme = theme.questionCount;
      var themeStats = stats && stats.themes[theme.id];
      var attempted = themeStats ? themeStats.attempted : 0;
      var attemptPct = totalQsInTheme > 0 ? Math.min(100, Math.round((attempted / totalQsInTheme) * 100)) : 0;

      // Theme color mapping
      var barColor = sub.color;

      html += '<div class="progress-theme-row">';
      html += '<div class="progress-theme-label">' +
        '<span class="theme-name">' + theme.name + '</span>' +
        '<span class="theme-stat">' + attempted + ' / ' + totalQsInTheme + ' attempted</span>' +
      '</div>';
      html += '<div class="progress-theme-bar"><div class="progress-theme-fill" style="width:' + attemptPct + '%;background:' + barColor + '"></div></div>';

      // Best scores per topic within this theme
      if (themeStats && themeStats.bestScores) {
        var hasScores = false;
        var scoresHtml = '<div class="progress-best-scores">';
        var catNames = QuizLoader.getCategoryNames(theme.id);
        for (var topicKey in themeStats.bestScores) {
          if (!themeStats.bestScores.hasOwnProperty(topicKey)) continue;
          hasScores = true;
          var topicName = catNames[topicKey] || topicKey;
          scoresHtml += '<div class="progress-best-item">' +
            '<span class="progress-best-name">' + topicName + '</span>' +
            '<span class="progress-best-score">' + themeStats.bestScores[topicKey] + '%</span>' +
          '</div>';
        }
        scoresHtml += '</div>';
        if (hasScores) html += scoresHtml;
      }

      html += '</div>';
    });

    html += '</div>';
  }

  subjectsEl.innerHTML = html;
}

// ── Navigation ──

function goDashboard() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
  removeOpenQuestionUI();
  renderDashboard();
}

function goHome() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
  removeOpenQuestionUI();
  selectTheme(currentTheme);
}

function goThemes() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
  removeOpenQuestionUI();
  selectSubject(currentSubject);
}

// ── Dark Mode ──

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  var btn = document.getElementById('themeToggle');
  if (btn) btn.innerHTML = theme === 'dark' ? '&#9788;' : '&#9790;';
}

function toggleDarkMode() {
  var current = document.documentElement.getAttribute('data-theme') || 'light';
  var next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem('natsquiz-theme', next); } catch(e) {}
}

function initTheme() {
  var saved = null;
  try { saved = localStorage.getItem('natsquiz-theme'); } catch(e) {}
  applyTheme(saved || 'light');
}

// ── Expose to HTML ──
window.QuizApp = {
  startQuiz: startQuiz,
  goHome: goHome,
  goThemes: goThemes,
  goDashboard: goDashboard,
  renderDashboard: renderDashboard,
  toggleDarkMode: toggleDarkMode,
  practiceWrongAnswers: practiceWrongAnswers,
  startReviewMode: startReviewMode,
  showProgress: showProgress
};

// ── Init ──
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  renderDashboard();
});

})();
