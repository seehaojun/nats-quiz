// Nat's Quiz — localStorage persistence + motivation system
(() => {

const STORAGE_KEY = 'natsquiz';

const CONFIG = {
  DAILY_TARGET_DEFAULT: 20,
  XP_PER_CORRECT: 10,
  XP_PER_WRONG: 2,
  XP_STREAK_BONUS: 5,
  XP_PERFECT_BONUS: 20,
  STREAK_BONUS_CAP_DAYS: 10,
  WRONG_BANK_LIMIT: 200,
  DAILY_COUNT_KEEP_DAYS: 7,
};

const LEVEL_THRESHOLDS = [
  0, 50, 150, 300, 500, 800, 1200, 1700, 2400, 3200,
  4200, 5500, 7000, 9000, 11500, 15000,
];

const LEVEL_TITLES = [
  'Beginner', 'Learner', 'Student', 'Scholar', 'Achiever', 'Expert',
  'Ace', 'Champion', 'Master', 'Wizard', 'Legend', 'Genius',
  'Prodigy', 'Virtuoso', 'Grandmaster', 'Supreme',
];

const BADGE_DEFS = [
  { id: 'first_quiz',    name: 'First Steps',     icon: '🎯', desc: 'Complete your first quiz' },
  { id: 'first_perfect', name: 'Perfect Score',   icon: '⭐', desc: 'Get 100% on any quiz' },
  { id: 'streak_3',      name: 'On a Roll',       icon: '🔥', desc: '3-day streak' },
  { id: 'streak_7',      name: 'Week Warrior',    icon: '💪', desc: '7-day streak' },
  { id: 'streak_14',     name: 'Unstoppable',     icon: '🏆', desc: '14-day streak' },
  { id: 'streak_30',     name: 'Monthly Master',  icon: '👑', desc: '30-day streak' },
  { id: 'q_100',         name: 'Century',         icon: '💯', desc: 'Answer 100 questions' },
  { id: 'q_500',         name: 'Half Thousand',   icon: '📚', desc: 'Answer 500 questions' },
  { id: 'q_1000',        name: 'Thousand Club',   icon: '🎓', desc: 'Answer 1000 questions' },
  { id: 'level_5',       name: 'Rising Star',     icon: '🌟', desc: 'Reach Level 5' },
  { id: 'level_10',      name: 'Superstar',       icon: '✨', desc: 'Reach Level 10' },
  { id: 'all_subjects',  name: 'Well Rounded',    icon: '🌈', desc: 'Try all 4 subjects' },
];

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
}

function getDefaults() {
  return {
    version: 2,
    dailyTarget: CONFIG.DAILY_TARGET_DEFAULT,
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: null,
    totalAnswered: 0,
    totalCorrect: 0,
    badges: [],
    scores: {},
    wrongBank: [],
    sr: {},
  };
}

function getData() {
  let d = load();
  if (!d || !d.version) d = getDefaults();
  if (d.version < 2) {
    const fresh = getDefaults();
    for (const k in d) if (k in fresh) fresh[k] = d[k];
    fresh.version = 2;
    d = fresh;
  }
  return d;
}

// ── Daily streak ──

const today = () => new Date().toISOString().slice(0, 10);

function updateStreak(data) {
  const t = today();
  if (data.lastActiveDate === t) return;

  if (data.lastActiveDate) {
    const last = new Date(data.lastActiveDate);
    const now = new Date(t);
    const diff = Math.floor((now - last) / 86400000);
    if (diff === 1) data.streak++;
    else if (diff > 1) data.streak = 1;
  } else {
    data.streak = 1;
  }
  data.lastActiveDate = t;
}

// ── XP & Levels ──

function xpForLevel(level) {
  if (level <= 0) return 0;
  if (level >= LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
      + (level - LEVEL_THRESHOLDS.length + 1) * 2000;
  }
  return LEVEL_THRESHOLDS[level];
}

function calcLevel(xp) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i;
  }
  return 0;
}

const getLevelTitle = (level) => LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)];

// ── Badges ──

function checkBadges(data) {
  const newBadges = [];
  const earned = data.badges || [];

  const award = (id) => {
    if (!earned.includes(id)) {
      earned.push(id);
      newBadges.push(id);
    }
  };

  if (data.totalAnswered >= 1)    award('first_quiz');
  if (data.totalAnswered >= 100)  award('q_100');
  if (data.totalAnswered >= 500)  award('q_500');
  if (data.totalAnswered >= 1000) award('q_1000');
  if (data.streak >= 3)  award('streak_3');
  if (data.streak >= 7)  award('streak_7');
  if (data.streak >= 14) award('streak_14');
  if (data.streak >= 30) award('streak_30');
  if (data.level >= 5)   award('level_5');
  if (data.level >= 10)  award('level_10');

  const subjects = {};
  for (const key in data.scores) {
    const parts = key.split('/');
    if (parts[0]) subjects[parts[0]] = true;
  }
  if (subjects.science && subjects.english && subjects.math && subjects.chinese) {
    award('all_subjects');
  }

  for (const k in data.scores) {
    if (data.scores[k].best === 100) { award('first_perfect'); break; }
  }

  data.badges = earned;
  return newBadges;
}

// ── Daily progress ──

function getDailyProgress(data) {
  const t = today();
  if (!data._dailyCounts) data._dailyCounts = {};
  return data._dailyCounts[t] || 0;
}

function addDailyCount(data, count) {
  const t = today();
  if (!data._dailyCounts) data._dailyCounts = {};
  data._dailyCounts[t] = (data._dailyCounts[t] || 0) + count;
  const keys = Object.keys(data._dailyCounts).sort();
  while (keys.length > CONFIG.DAILY_COUNT_KEEP_DAYS) {
    delete data._dailyCounts[keys.shift()];
  }
}

// ── Record quiz result ──

function recordQuizResult(subject, theme, topic, totalQs, correctQs, wrongList, openMarks) {
  const data = getData();
  const key = `${subject}/${theme}/${topic}`;
  const pct = Math.round((correctQs / totalQs) * 100);

  if (!data.scores[key]) {
    data.scores[key] = { best: 0, attempts: 0, lastDate: null };
  }
  data.scores[key].attempts++;
  data.scores[key].lastDate = today();
  if (pct > data.scores[key].best) data.scores[key].best = pct;

  // Round so integer counters don't drift on fractional open-Q scores.
  data.totalAnswered += totalQs;
  data.totalCorrect += Math.round(correctQs);

  // XP — works with fractional correctQs (open-Q topics contribute partial credit).
  let xpGained = (correctQs * CONFIG.XP_PER_CORRECT)
    + ((totalQs - correctQs) * CONFIG.XP_PER_WRONG);
  if (pct === 100) xpGained += CONFIG.XP_PERFECT_BONUS;
  xpGained += Math.min(data.streak, CONFIG.STREAK_BONUS_CAP_DAYS) * CONFIG.XP_STREAK_BONUS;
  xpGained = Math.round(xpGained);
  data.xp += xpGained;
  data.level = calcLevel(data.xp);

  updateStreak(data);
  addDailyCount(data, totalQs);

  if (wrongList && wrongList.length > 0) {
    wrongList.forEach(w => {
      const exists = data.wrongBank.some(e => e.q === w.question);
      if (exists) return;
      const entry = {
        subject, theme,
        q: w.question,
        opts: null,
        correctAnswer: w.correctAnswer,
        explain: w.explain,
        addedDate: today(),
      };
      if (w.type === 'open') {
        entry.type = 'open';
        entry.studentAnswer = w.studentAnswer;
        entry.modelAnswer = w.modelAnswer;
        entry.feedback = w.feedback;
        entry.maxMarks = w.maxMarks;
      }
      data.wrongBank.push(entry);
    });
    if (data.wrongBank.length > CONFIG.WRONG_BANK_LIMIT) {
      data.wrongBank = data.wrongBank.slice(-CONFIG.WRONG_BANK_LIMIT);
    }
  }

  const newBadges = checkBadges(data);
  save(data);
  return { xpGained, newBadges, level: data.level, streak: data.streak, openMarks };
}

// ── Wrong bank helpers ──

const getWrongBankItems = () => getData().wrongBank || [];

function getRandomWrongBankItems(max) {
  const items = getWrongBankItems();
  if (items.length <= max) return items.slice();
  const a = items.slice();
  for (let i = a.length - 1; i > 0 && i >= a.length - max; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(a.length - max);
}

function removeFromWrongBank(questionText) {
  const data = getData();
  data.wrongBank = (data.wrongBank || []).filter(w => w.q !== questionText);
  save(data);
}

// ── Per-subject stats ──

function getSubjectStats() {
  const data = getData();
  const stats = {};
  for (const key in data.scores) {
    const [subject, theme, topic] = key.split('/');
    const s = data.scores[key];

    if (!stats[subject]) {
      stats[subject] = { totalAnswered: 0, totalAttempts: 0, themes: {}, bestScores: {} };
    }
    stats[subject].totalAttempts += s.attempts;

    if (!stats[subject].themes[theme]) {
      stats[subject].themes[theme] = { attempted: 0, bestScores: {} };
    }
    stats[subject].themes[theme].attempted += s.attempts;
    stats[subject].themes[theme].bestScores[topic] = s.best;

    stats[subject].bestScores[`${theme}/${topic}`] = s.best;
  }
  return stats;
}

const getDailyCounts = (data) => data._dailyCounts || {};

// ── Expose ──

window.QuizStorage = {
  getData,
  save,
  recordQuizResult,
  getDailyProgress,
  today,
  calcLevel,
  xpForLevel,
  getLevelTitle,
  BADGE_DEFS,
  XP_PER_CORRECT: CONFIG.XP_PER_CORRECT,
  getWrongBankItems,
  getRandomWrongBankItems,
  removeFromWrongBank,
  getSubjectStats,
  getDailyCounts,
};

})();
