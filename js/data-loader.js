// Data loader — subjects, themes, categories, and content validation
window.QUIZ_DATA = window.QUIZ_DATA || {};

const QuizLoader = {
  subjects: {
    science: { name: 'Science',  icon: '🔬', color: '#3b82f6', desc: 'P4 Science' },
    english: { name: 'English',  icon: '📖', color: '#10b981', desc: 'P4 English Language' },
    math:    { name: 'Math',     icon: '🔢', color: '#f59e0b', desc: 'P4 Mathematics' },
    chinese: { name: 'Chinese',  icon: '🏮', color: '#ef4444', desc: 'P4 Chinese Language' },
  },

  themes: {
    // Science
    diversity:     { subject: 'science', name: 'Diversity',                 icon: '🌿',  color: 'diversity',     description: 'Living & non-living things, plants, classification' },
    cycles:        { subject: 'science', name: 'Cycles',                    icon: '🔄',  color: 'cycles',        description: 'Water cycle, life cycles of plants & animals' },
    systems:       { subject: 'science', name: 'Systems',                   icon: '⚙️',  color: 'systems',       description: 'Human body, plant transport, electrical circuits' },
    energy:        { subject: 'science', name: 'Energy',                    icon: '⚡',  color: 'energy',        description: 'Light, heat, forces, photosynthesis' },
    interactions:  { subject: 'science', name: 'Interactions',              icon: '🤝',  color: 'interactions',  description: 'Food chains, adaptations, environment' },
    matter:        { subject: 'science', name: 'Matter',                    icon: '🧊',  color: 'matter',        description: 'States of matter, changes of state' },
    magnets:       { subject: 'science', name: 'Magnets',                   icon: '🧲',  color: 'magnets',       description: 'Magnetic properties, poles, uses of magnets' },
    openended:     { subject: 'science', name: 'Open-Ended Questions',      icon: '✍️',  color: 'openended',     description: 'Long-form answers across all Science topics, graded by Claude' },
    // English
    grammar:       { subject: 'english', name: 'Grammar',                   icon: '✏️',  color: 'grammar',       description: 'Tenses, articles, prepositions, conjunctions' },
    vocabulary:    { subject: 'english', name: 'Vocabulary',                icon: '📝',  color: 'vocabulary',    description: 'Word meanings, synonyms, antonyms' },
    comprehension: { subject: 'english', name: 'Comprehension',             icon: '📄',  color: 'comprehension', description: 'Reading passages, inference, main idea' },
    synthesis:     { subject: 'english', name: 'Synthesis & Transformation',icon: '🔗',  color: 'synthesis',     description: 'Sentence combining & restructuring' },
    editing:       { subject: 'english', name: 'Editing',                   icon: '🔍',  color: 'editing',       description: 'Spelling and grammar error correction' },
    visualtext:    { subject: 'english', name: 'Visual Text',               icon: '📋',  color: 'visualtext',    description: 'Notices, posters, advertisements' },
    vocabcloze:    { subject: 'english', name: 'Vocabulary Cloze',          icon: '📝',  color: 'vocabcloze',    description: 'Fill in the blank with context clues' },
    // Math
    wholenumbers:  { subject: 'math',    name: 'Whole Numbers',             icon: '🔢',  color: 'wholenumbers',  description: 'Place value, rounding, estimation, operations' },
    fractions:     { subject: 'math',    name: 'Fractions',                 icon: '🍕',  color: 'fractions',     description: 'Equivalent fractions, mixed numbers, operations' },
    decimals:      { subject: 'math',    name: 'Decimals',                  icon: '🔣',  color: 'decimals',      description: 'Place value, comparing, adding, subtracting, multiply & divide by 10/100' },
    measurement:   { subject: 'math',    name: 'Measurement',               icon: '📏',  color: 'measurement',   description: 'Length, mass, volume — conversions & word problems' },
    money:         { subject: 'math',    name: 'Money',                     icon: '💰',  color: 'money',         description: 'Adding, subtracting, word problems with dollars & cents' },
    geometry:      { subject: 'math',    name: 'Geometry',                  icon: '📐',  color: 'geometry',      description: 'Angles, symmetry, area, perimeter' },
    tables:        { subject: 'math',    name: 'Tables & Graphs',           icon: '📊',  color: 'tables',        description: 'Data, tables, bar graphs, line graphs' },
    // Chinese
    hanzi:         { subject: 'chinese', name: '汉字 Words',                icon: '字',  color: 'hanzi',         description: 'Characters, radicals, stroke order' },
    yufa:          { subject: 'chinese', name: '语法 Grammar',              icon: '文',  color: 'yufa',          description: 'Sentence structure, measure words, grammar patterns' },
    cloze:         { subject: 'chinese', name: '完形填空 Cloze',            icon: '📋',  color: 'cloze',         description: 'Fill in the blanks, contextual word choice' },
    yuedu:         { subject: 'chinese', name: '阅读理解 Comprehension',     icon: '📖',  color: 'yuedu',         description: 'Reading passages, Q&A' },
    chengyu:       { subject: 'chinese', name: '成语 Idioms',               icon: '🏷️', color: 'chengyu',       description: 'Chinese idioms — meaning and usage' },
    sentence:      { subject: 'chinese', name: '句子 Sentences',            icon: '✍️',  color: 'sentence',      description: 'Sentence transformation and rewriting' },
  },

  // Minimal runtime schema check — surfaces malformed questions to the console
  // without breaking the app. Returns count of invalid questions found.
  validateAll() {
    let invalid = 0;
    for (const themeId in window.QUIZ_DATA) {
      const themeData = window.QUIZ_DATA[themeId];
      for (const cat in themeData) {
        const list = themeData[cat];
        if (!Array.isArray(list)) {
          console.warn(`[QuizLoader] ${themeId}.${cat} is not an array`);
          invalid++;
          continue;
        }
        list.forEach((q, i) => {
          if (!q || typeof q.q !== 'string') {
            console.warn(`[QuizLoader] Invalid question at ${themeId}.${cat}[${i}]`, q);
            invalid++;
            return;
          }
          if (q.type === 'open') {
            // Open-ended: { type:'open', q, model_answer, rubric, max_marks }
            if (typeof q.model_answer !== 'string'
                || (q.max_marks != null && typeof q.max_marks !== 'number')) {
              console.warn(`[QuizLoader] Invalid open question at ${themeId}.${cat}[${i}]`, q);
              invalid++;
            }
            return;
          }
          // MCQ: { q, opts, ans, explain }
          if (!Array.isArray(q.opts) || q.opts.length < 2
              || typeof q.ans !== 'number'
              || q.ans < 0 || q.ans >= q.opts.length) {
            console.warn(`[QuizLoader] Invalid MCQ at ${themeId}.${cat}[${i}]`, q);
            invalid++;
          }
        });
      }
    }
    return invalid;
  },

  getThemeData(themeId) {
    return window.QUIZ_DATA[themeId] || null;
  },

  getThemeQuestionCount(themeId) {
    const data = this.getThemeData(themeId);
    if (!data) return 0;
    let total = 0;
    for (const key in data) total += data[key].length;
    return total;
  },

  isThemeLoaded(themeId) {
    return !!window.QUIZ_DATA[themeId];
  },

  getThemesForSubject(subjectId) {
    const result = [];
    for (const id in this.themes) {
      if (this.themes[id].subject !== subjectId) continue;
      result.push({
        id,
        name: this.themes[id].name,
        icon: this.themes[id].icon,
        color: this.themes[id].color,
        description: this.themes[id].description,
        loaded: this.isThemeLoaded(id),
        questionCount: this.getThemeQuestionCount(id),
      });
    }
    return result;
  },

  getSubjectQuestionCount(subjectId) {
    return this.getThemesForSubject(subjectId)
      .reduce((sum, t) => sum + t.questionCount, 0);
  },

  getAvailableThemes() {
    const result = [];
    for (const id in this.themes) {
      result.push({
        id,
        name: this.themes[id].name,
        icon: this.themes[id].icon,
        color: this.themes[id].color,
        description: this.themes[id].description,
        loaded: this.isThemeLoaded(id),
        questionCount: this.getThemeQuestionCount(id),
      });
    }
    return result;
  },

  getCategoryNames(themeId) {
    const data = this.getThemeData(themeId);
    if (!data) return {};
    const names = {};
    for (const key in data) {
      if (key === 'tricky')           names[key] = 'Tricky Questions';
      else if (key === 'notqs')       names[key] = 'Which Is NOT? Questions';
      else if (key === 'apply')       names[key] = 'Application & Thinking Questions';
      else if (key === 'plantsys')    names[key] = 'Plant Parts & Functions';
      else if (key === 'hard')        names[key] = 'Hard Questions';
      else if (key === 'compare')     names[key] = 'Comparison Questions';
      else if (key === 'open')        names[key] = 'Open-Ended Questions';
      else if (key === 'spelling')    names[key] = 'Spelling Errors';
      else if (key === 'punctuation') names[key] = 'Punctuation Errors';
      else if (key === 'grammar_edit')names[key] = 'Grammar Errors';
      else if (key === 'posters')     names[key] = 'Posters & Flyers';
      else if (key === 'labels')      names[key] = 'Labels & Signs';
      else if (key === 'ads')         names[key] = 'Advertisements';
      else if (key.startsWith('ch'))  names[key] = 'Chapter ' + key.replace('ch', '');
      else                            names[key] = key;
    }
    // Theme-specific overrides
    const overrides = {
      diversity: { ch1: 'Chapter 1: Classifying Things', ch2: 'Chapter 2: Living & Non-Living Things', ch3: 'Chapter 3: Plants' },
      matter: { ch1: 'Ch 8: What Is Matter?', ch2: 'Ch 8: Air As Matter', ch3: 'Ch 8: Three States Of Matter' },
      systems: { ch1: 'Ch 9: What Is A System?', ch2: 'Ch 10: The Digestive System', ch3: 'Ch 11: Respiratory & Circulatory Systems', ch4: 'Plant Transport System', ch5: 'Electrical Circuits' },
      magnets: { ch1: 'Chapter 1: Properties of Magnets', ch2: 'Chapter 2: Uses of Magnets' },
      money: { ch1: 'Chapter 1: Addition & Subtraction of Money', ch2: 'Chapter 2: Word Problems with Money' },
      decimals: { ch1: 'Chapter 1: Understanding Decimals', ch2: 'Chapter 2: Comparing & Ordering Decimals', ch3: 'Chapter 3: Operations with Decimals' },
      vocabcloze: { ch1: 'Everyday Words', ch2: 'Descriptive Words', ch3: 'Action Words' },
    };
    if (overrides[themeId]) {
      for (const k in overrides[themeId]) {
        if (k in names) names[k] = overrides[themeId][k];
      }
    }
    // measurement uses both ch-style and named keys
    if (themeId === 'measurement') {
      const m = { ch1: 'Chapter 1: Length & Distance', ch2: 'Chapter 2: Mass', ch3: 'Chapter 3: Volume & Capacity', length: 'Length & Distance', mass: 'Mass', volume: 'Volume & Capacity' };
      for (const k in m) {
        if (k in names) names[k] = m[k];
      }
    }
    // Open-ended virtual theme: categories are source theme ids.
    if (themeId === 'openended') {
      const labels = {
        diversity: 'Diversity',
        cycles: 'Life Cycles & Water Cycle',
        systems: 'Plant & Human Systems',
        energy: 'Energy',
        interactions: 'Interactions',
        matter: 'Matter',
        magnets: 'Magnets',
      };
      for (const lk in labels) {
        if (names[lk]) names[lk] = labels[lk];
      }
    }
    return names;
  },
};

window.QuizLoader = QuizLoader;

// Synthesize a virtual `openended` theme that pools every science theme's
// `open` array under the source theme's id. Runs at script load, after all
// data/*.js files have populated window.QUIZ_DATA.
(() => {
  const sciencePool = ['diversity', 'cycles', 'systems', 'energy', 'interactions', 'matter', 'magnets'];
  const pooled = {};
  sciencePool.forEach(themeId => {
    const theme = window.QUIZ_DATA[themeId];
    if (theme && Array.isArray(theme.open) && theme.open.length > 0) {
      pooled[themeId] = theme.open;
    }
  });
  if (Object.keys(pooled).length > 0) {
    window.QUIZ_DATA.openended = pooled;
  }
})();

// Run validation once on load (non-blocking; warnings only)
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const invalid = QuizLoader.validateAll();
    if (invalid > 0) console.warn(`[QuizLoader] ${invalid} invalid question(s) detected`);
  });
}
