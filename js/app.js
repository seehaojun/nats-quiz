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
  hardScore = 0;
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
  document.getElementById('qNumber').textContent = 'Question ' + (currentIndex + 1) + ' of ' + currentQuestions.length;
  document.getElementById('qText').textContent = q.q;
  document.getElementById('scoreDisplay').textContent = score + ' / ' + currentQuestions.length;
  document.getElementById('progressFill').style.width = (currentIndex / currentQuestions.length * 100) + '%';

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
    if (idx === q.ans) { score++; el.classList.add('correct'); }
    else { el.classList.add('wrong'); wrongAnswers.push({ question: q.q, yourAnswer: q.opts[idx], correctAnswer: q.opts[q.ans], explain: q.explain }); }
    document.getElementById('scoreDisplay').textContent = score + ' / ' + currentQuestions.length;
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

  // Record result and get XP info
  var result = QuizStorage.recordQuizResult(
    currentSubject, currentTheme, currentTopic,
    currentQuestions.length, score, wrongAnswers
  );

  showScreen('resultsScreen');
  var g = document.getElementById('gradeLabel');
  var pct;
  if (isHardMode) {
    var maxPossible = currentQuestions.length * 2;
    document.getElementById('finalScore').innerHTML = hardScore.toFixed(2) + ' <span>/ ' + maxPossible + ' pts</span>';
    pct = Math.round((score / currentQuestions.length) * 100);
  } else {
    pct = Math.round((score / currentQuestions.length) * 100);
    document.getElementById('finalScore').innerHTML = score + ' <span>/ ' + currentQuestions.length + ' (' + pct + '%)</span>';
  }
  if (pct >= 90) { g.textContent = 'Excellent!'; g.className = 'grade gold'; }
  else if (pct >= 70) { g.textContent = 'Good Job!'; g.className = 'grade silver'; }
  else if (pct >= 50) { g.textContent = 'Keep Trying!'; g.className = 'grade bronze'; }
  else { g.textContent = 'Study More & Try Again!'; g.className = 'grade try'; }

  // XP display
  var xpEl = document.getElementById('xpGained');
  xpEl.innerHTML = '+' + result.xpGained + ' XP' +
    (result.streak > 1 ? ' &middot; ' + result.streak + '-day streak 🔥' : '');
  xpEl.style.display = 'block';

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

  var wl = document.getElementById('wrongList');
  if (wrongAnswers.length === 0) {
    wl.innerHTML = '<p style="color:#38a169;font-weight:600;margin-top:12px;">Perfect! Every answer correct!</p>';
  } else {
    var h = '<h3>Review These (' + wrongAnswers.length + ' wrong):</h3>';
    wrongAnswers.forEach(function(w, i) {
      h += '<div class="wrong-item"><div class="wi-q">' + (i + 1) + '. ' + w.question + '</div>';
      h += '<div style="color:#e53e3e;">You picked: ' + w.yourAnswer + '</div>';
      h += '<div class="wi-a">Answer: ' + w.correctAnswer + '</div>';
      h += '<div style="color:#666;font-size:13px;margin-top:4px;">' + w.explain + '</div></div>';
    });
    wl.innerHTML = h;
  }
}

// ── Navigation ──

function goDashboard() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
  renderDashboard();
}

function goHome() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
  selectTheme(currentTheme);
}

function goThemes() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
  selectSubject(currentSubject);
}

// ── Expose to HTML ──
window.QuizApp = {
  startQuiz: startQuiz,
  goHome: goHome,
  goThemes: goThemes,
  goDashboard: goDashboard,
  renderDashboard: renderDashboard
};

// ── Init ──
document.addEventListener('DOMContentLoaded', function() {
  renderDashboard();
});

})();
