// Nat's Quiz — localStorage persistence + motivation system
(function() {

var STORAGE_KEY = 'natsquiz';

function load() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return null;
}

function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
}

function getDefaults() {
  return {
    version: 2,
    dailyTarget: 20,
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: null,
    totalAnswered: 0,
    totalCorrect: 0,
    badges: [],
    scores: {},      // { "science/diversity/ch1": { best: 90, attempts: 3, lastDate: "..." } }
    wrongBank: [],    // [ { subject, theme, q, opts, ans, explain } ] — for review mode
    sr: {}            // spaced repetition boxes: { "hash": { box: 1, nextDue: "2026-03-28" } }
  };
}

function getData() {
  var d = load();
  if (!d || !d.version) d = getDefaults();
  // Migrate if needed
  if (d.version < 2) {
    var fresh = getDefaults();
    for (var k in d) { if (fresh.hasOwnProperty(k)) fresh[k] = d[k]; }
    fresh.version = 2;
    d = fresh;
  }
  return d;
}

// ── Daily streak ──

function today() {
  return new Date().toISOString().slice(0, 10);
}

function updateStreak(data) {
  var t = today();
  if (data.lastActiveDate === t) return; // already counted today

  if (data.lastActiveDate) {
    var last = new Date(data.lastActiveDate);
    var now = new Date(t);
    var diff = Math.floor((now - last) / 86400000);
    if (diff === 1) {
      data.streak++;
    } else if (diff > 1) {
      data.streak = 1; // reset
    }
  } else {
    data.streak = 1;
  }
  data.lastActiveDate = t;
}

// ── XP & Levels ──

var XP_PER_CORRECT = 10;
var XP_PER_WRONG = 2;    // still get XP for trying
var XP_STREAK_BONUS = 5; // per day of streak
var LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 800, 1200, 1700, 2400, 3200, 4200, 5500, 7000, 9000, 11500, 15000];

function xpForLevel(level) {
  if (level <= 0) return 0;
  if (level >= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (level - LEVEL_THRESHOLDS.length + 1) * 2000;
  return LEVEL_THRESHOLDS[level];
}

function calcLevel(xp) {
  for (var i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i;
  }
  return 0;
}

function getLevelTitle(level) {
  var titles = ['Beginner', 'Learner', 'Student', 'Scholar', 'Achiever', 'Expert', 'Ace', 'Champion', 'Master', 'Wizard', 'Legend', 'Genius', 'Prodigy', 'Virtuoso', 'Grandmaster', 'Supreme'];
  return titles[Math.min(level, titles.length - 1)];
}

// ── Badges ──

var BADGE_DEFS = [
  { id: 'first_quiz', name: 'First Steps', icon: '🎯', desc: 'Complete your first quiz' },
  { id: 'first_perfect', name: 'Perfect Score', icon: '⭐', desc: 'Get 100% on any quiz' },
  { id: 'streak_3', name: 'On a Roll', icon: '🔥', desc: '3-day streak' },
  { id: 'streak_7', name: 'Week Warrior', icon: '💪', desc: '7-day streak' },
  { id: 'streak_14', name: 'Unstoppable', icon: '🏆', desc: '14-day streak' },
  { id: 'streak_30', name: 'Monthly Master', icon: '👑', desc: '30-day streak' },
  { id: 'q_100', name: 'Century', icon: '💯', desc: 'Answer 100 questions' },
  { id: 'q_500', name: 'Half Thousand', icon: '📚', desc: 'Answer 500 questions' },
  { id: 'q_1000', name: 'Thousand Club', icon: '🎓', desc: 'Answer 1000 questions' },
  { id: 'level_5', name: 'Rising Star', icon: '🌟', desc: 'Reach Level 5' },
  { id: 'level_10', name: 'Superstar', icon: '✨', desc: 'Reach Level 10' },
  { id: 'all_subjects', name: 'Well Rounded', icon: '🌈', desc: 'Try all 4 subjects' }
];

function checkBadges(data) {
  var newBadges = [];
  var earned = data.badges || [];

  function award(id) {
    if (earned.indexOf(id) === -1) {
      earned.push(id);
      newBadges.push(id);
    }
  }

  if (data.totalAnswered >= 1) award('first_quiz');
  if (data.totalAnswered >= 100) award('q_100');
  if (data.totalAnswered >= 500) award('q_500');
  if (data.totalAnswered >= 1000) award('q_1000');
  if (data.streak >= 3) award('streak_3');
  if (data.streak >= 7) award('streak_7');
  if (data.streak >= 14) award('streak_14');
  if (data.streak >= 30) award('streak_30');
  if (data.level >= 5) award('level_5');
  if (data.level >= 10) award('level_10');

  // Check all subjects attempted
  var subjects = {};
  for (var key in data.scores) {
    var parts = key.split('/');
    if (parts[0]) subjects[parts[0]] = true;
  }
  if (subjects.science && subjects.english && subjects.math && subjects.chinese) {
    award('all_subjects');
  }

  // Check for any perfect score
  for (var k in data.scores) {
    if (data.scores[k].best === 100) { award('first_perfect'); break; }
  }

  data.badges = earned;
  return newBadges;
}

// ── Daily progress ──

function getDailyProgress(data) {
  var t = today();
  // Count questions answered today from scores
  // Simple approach: track in data
  if (!data._dailyCounts) data._dailyCounts = {};
  return data._dailyCounts[t] || 0;
}

function addDailyCount(data, count) {
  var t = today();
  if (!data._dailyCounts) data._dailyCounts = {};
  data._dailyCounts[t] = (data._dailyCounts[t] || 0) + count;
  // Clean old daily counts (keep last 7 days)
  var keys = Object.keys(data._dailyCounts).sort();
  while (keys.length > 7) {
    delete data._dailyCounts[keys.shift()];
  }
}

// ── Record quiz result ──

function recordQuizResult(subject, theme, topic, totalQs, correctQs, wrongList) {
  var data = getData();
  var key = subject + '/' + theme + '/' + topic;
  var pct = Math.round((correctQs / totalQs) * 100);

  // Update score
  if (!data.scores[key]) {
    data.scores[key] = { best: 0, attempts: 0, lastDate: null };
  }
  data.scores[key].attempts++;
  data.scores[key].lastDate = today();
  if (pct > data.scores[key].best) data.scores[key].best = pct;

  // Update totals
  data.totalAnswered += totalQs;
  data.totalCorrect += correctQs;

  // XP
  var xpGained = (correctQs * XP_PER_CORRECT) + ((totalQs - correctQs) * XP_PER_WRONG);
  if (pct === 100) xpGained += 20; // perfect bonus
  xpGained += Math.min(data.streak, 10) * XP_STREAK_BONUS; // streak bonus capped at 10 days
  data.xp += xpGained;
  data.level = calcLevel(data.xp);

  // Streak
  updateStreak(data);

  // Daily count
  addDailyCount(data, totalQs);

  // Wrong bank (for review mode) — deduplicate by question text
  if (wrongList && wrongList.length > 0) {
    wrongList.forEach(function(w) {
      // Check if already in wrong bank
      var exists = data.wrongBank.some(function(existing) {
        return existing.q === w.question;
      });
      if (!exists) {
        data.wrongBank.push({
          subject: subject,
          theme: theme,
          q: w.question,
          opts: null, // will be populated from original data if needed
          correctAnswer: w.correctAnswer,
          explain: w.explain,
          addedDate: today()
        });
      }
    });
    // Keep wrong bank manageable
    if (data.wrongBank.length > 200) {
      data.wrongBank = data.wrongBank.slice(-200);
    }
  }

  // Badges
  var newBadges = checkBadges(data);

  save(data);
  return { xpGained: xpGained, newBadges: newBadges, level: data.level, streak: data.streak };
}

// ── Wrong bank helpers ──

function getWrongBankItems() {
  var data = getData();
  return data.wrongBank || [];
}

function getRandomWrongBankItems(max) {
  var items = getWrongBankItems();
  if (items.length <= max) return items.slice();
  // Fisher-Yates partial shuffle
  var a = items.slice();
  for (var i = a.length - 1; i > 0 && i >= a.length - max; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a.slice(a.length - max);
}

function removeFromWrongBank(questionText) {
  var data = getData();
  data.wrongBank = (data.wrongBank || []).filter(function(w) {
    return w.q !== questionText;
  });
  save(data);
}

// ── Per-subject stats ──

function getSubjectStats() {
  var data = getData();
  var stats = {};
  for (var key in data.scores) {
    if (!data.scores.hasOwnProperty(key)) continue;
    var parts = key.split('/');
    var subject = parts[0];
    var theme = parts[1];
    var topic = parts[2];
    var s = data.scores[key];

    if (!stats[subject]) {
      stats[subject] = { totalAnswered: 0, totalAttempts: 0, themes: {}, bestScores: {} };
    }
    stats[subject].totalAttempts += s.attempts;

    if (!stats[subject].themes[theme]) {
      stats[subject].themes[theme] = { attempted: 0, bestScores: {} };
    }
    stats[subject].themes[theme].attempted += s.attempts;
    stats[subject].themes[theme].bestScores[topic] = s.best;

    var scoreKey = theme + '/' + topic;
    stats[subject].bestScores[scoreKey] = s.best;
  }
  return stats;
}

function getDailyCounts(data) {
  return data._dailyCounts || {};
}

// ── Expose ──

window.QuizStorage = {
  getData: getData,
  save: save,
  recordQuizResult: recordQuizResult,
  getDailyProgress: getDailyProgress,
  today: today,
  calcLevel: calcLevel,
  xpForLevel: xpForLevel,
  getLevelTitle: getLevelTitle,
  BADGE_DEFS: BADGE_DEFS,
  XP_PER_CORRECT: XP_PER_CORRECT,
  getWrongBankItems: getWrongBankItems,
  getRandomWrongBankItems: getRandomWrongBankItems,
  removeFromWrongBank: removeFromWrongBank,
  getSubjectStats: getSubjectStats,
  getDailyCounts: getDailyCounts
};

})();
