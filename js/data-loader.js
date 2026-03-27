// Data loader — subjects, themes, categories
window.QUIZ_DATA = window.QUIZ_DATA || {};

var QuizLoader = {
  subjects: {
    science: { name: 'Science', icon: '🔬', color: '#3182ce', desc: 'P4 Science' },
    english: { name: 'English', icon: '📖', color: '#38a169', desc: 'P4 English Language' },
    math:    { name: 'Math', icon: '🔢', color: '#d69e2e', desc: 'P4 Mathematics' },
    chinese: { name: 'Chinese', icon: '🏮', color: '#e53e3e', desc: 'P4 Chinese Language' }
  },

  themes: {
    // Science
    diversity:    { subject: 'science', name: 'Diversity', icon: '🌿', color: 'diversity', description: 'Living & non-living things, plants, classification' },
    cycles:       { subject: 'science', name: 'Cycles', icon: '🔄', color: 'cycles', description: 'Water cycle, life cycles of plants & animals' },
    systems:      { subject: 'science', name: 'Systems', icon: '⚙️', color: 'systems', description: 'Human body, plant transport, electrical circuits' },
    energy:       { subject: 'science', name: 'Energy', icon: '⚡', color: 'energy', description: 'Light, heat, forces, photosynthesis' },
    interactions: { subject: 'science', name: 'Interactions', icon: '🤝', color: 'interactions', description: 'Food chains, adaptations, environment' },
    matter:       { subject: 'science', name: 'Matter', icon: '🧊', color: 'matter', description: 'States of matter, changes of state' },
    magnets:      { subject: 'science', name: 'Magnets', icon: '🧲', color: 'magnets', description: 'Magnetic properties, poles, uses of magnets' },
    // English
    grammar:      { subject: 'english', name: 'Grammar', icon: '✏️', color: 'grammar', description: 'Tenses, articles, prepositions, conjunctions' },
    vocabulary:   { subject: 'english', name: 'Vocabulary', icon: '📝', color: 'vocabulary', description: 'Word meanings, synonyms, antonyms' },
    comprehension:{ subject: 'english', name: 'Comprehension', icon: '📄', color: 'comprehension', description: 'Reading passages, inference, main idea' },
    synthesis:    { subject: 'english', name: 'Synthesis & Transformation', icon: '🔗', color: 'synthesis', description: 'Sentence combining & restructuring' },
    editing:      { subject: 'english', name: 'Editing', icon: '🔍', color: 'editing', description: 'Spelling and grammar error correction' },
    visualtext:   { subject: 'english', name: 'Visual Text', icon: '📋', color: 'visualtext', description: 'Notices, posters, advertisements' },
    vocabcloze:   { subject: 'english', name: 'Vocabulary Cloze', icon: '📝', color: 'vocabcloze', description: 'Fill in the blank with context clues' },
    // Math
    wholenumbers: { subject: 'math', name: 'Whole Numbers', icon: '🔢', color: 'wholenumbers', description: 'Place value, rounding, estimation, operations' },
    fractions:    { subject: 'math', name: 'Fractions', icon: '🍕', color: 'fractions', description: 'Equivalent fractions, mixed numbers, operations' },
    decimals:     { subject: 'math', name: 'Decimals', icon: '🔣', color: 'decimals', description: 'Place value, comparing, adding, subtracting, multiply & divide by 10/100' },
    measurement:  { subject: 'math', name: 'Measurement', icon: '📏', color: 'measurement', description: 'Length, mass, volume — conversions & word problems' },
    money:        { subject: 'math', name: 'Money', icon: '💰', color: 'money', description: 'Adding, subtracting, word problems with dollars & cents' },
    geometry:     { subject: 'math', name: 'Geometry', icon: '📐', color: 'geometry', description: 'Angles, symmetry, area, perimeter' },
    tables:       { subject: 'math', name: 'Tables & Graphs', icon: '📊', color: 'tables', description: 'Data, tables, bar graphs, line graphs' },
    // Chinese
    hanzi:        { subject: 'chinese', name: '汉字 Words', icon: '字', color: 'hanzi', description: 'Characters, radicals, stroke order' },
    yufa:         { subject: 'chinese', name: '语法 Grammar', icon: '文', color: 'yufa', description: 'Sentence structure, measure words, grammar patterns' },
    cloze:        { subject: 'chinese', name: '完形填空 Cloze', icon: '📋', color: 'cloze', description: 'Fill in the blanks, contextual word choice' },
    yuedu:        { subject: 'chinese', name: '阅读理解 Comprehension', icon: '📖', color: 'yuedu', description: 'Reading passages, Q&A' },
    chengyu:      { subject: 'chinese', name: '成语 Idioms', icon: '🏷️', color: 'chengyu', description: 'Chinese idioms — meaning and usage' },
    sentence:     { subject: 'chinese', name: '句子 Sentences', icon: '✍️', color: 'sentence', description: 'Sentence transformation and rewriting' }
  },

  getThemeData: function(themeId) {
    return window.QUIZ_DATA[themeId] || null;
  },

  getThemeQuestionCount: function(themeId) {
    var data = this.getThemeData(themeId);
    if (!data) return 0;
    var total = 0;
    for (var key in data) {
      if (data.hasOwnProperty(key)) total += data[key].length;
    }
    return total;
  },

  isThemeLoaded: function(themeId) {
    return !!window.QUIZ_DATA[themeId];
  },

  getThemesForSubject: function(subjectId) {
    var result = [];
    for (var id in this.themes) {
      if (this.themes.hasOwnProperty(id) && this.themes[id].subject === subjectId) {
        result.push({
          id: id,
          name: this.themes[id].name,
          icon: this.themes[id].icon,
          color: this.themes[id].color,
          description: this.themes[id].description,
          loaded: this.isThemeLoaded(id),
          questionCount: this.getThemeQuestionCount(id)
        });
      }
    }
    return result;
  },

  getSubjectQuestionCount: function(subjectId) {
    var themes = this.getThemesForSubject(subjectId);
    var total = 0;
    themes.forEach(function(t) { total += t.questionCount; });
    return total;
  },

  getAvailableThemes: function() {
    var result = [];
    for (var id in this.themes) {
      if (this.themes.hasOwnProperty(id)) {
        result.push({
          id: id,
          name: this.themes[id].name,
          icon: this.themes[id].icon,
          color: this.themes[id].color,
          description: this.themes[id].description,
          loaded: this.isThemeLoaded(id),
          questionCount: this.getThemeQuestionCount(id)
        });
      }
    }
    return result;
  },

  getCategoryNames: function(themeId) {
    var data = this.getThemeData(themeId);
    if (!data) return {};
    var names = {};
    for (var key in data) {
      if (!data.hasOwnProperty(key)) continue;
      if (key === 'tricky') names[key] = 'Tricky Questions';
      else if (key === 'notqs') names[key] = 'Which Is NOT? Questions';
      else if (key === 'apply') names[key] = 'Application & Thinking Questions';
      else if (key === 'plantsys') names[key] = 'Plant Parts & Functions';
      else if (key === 'hard') names[key] = 'Hard Questions';
      else if (key === 'compare') names[key] = 'Comparison Questions';
      else if (key === 'spelling') names[key] = 'Spelling Errors';
      else if (key === 'punctuation') names[key] = 'Punctuation Errors';
      else if (key === 'grammar_edit') names[key] = 'Grammar Errors';
      else if (key === 'posters') names[key] = 'Posters & Flyers';
      else if (key === 'labels') names[key] = 'Labels & Signs';
      else if (key === 'ads') names[key] = 'Advertisements';
      else if (key.startsWith('ch')) names[key] = 'Chapter ' + key.replace('ch', '');
      else names[key] = key;
    }
    // Theme-specific overrides
    if (themeId === 'diversity') {
      names.ch1 = 'Chapter 1: Classifying Things';
      names.ch2 = 'Chapter 2: Living & Non-Living Things';
      names.ch3 = 'Chapter 3: Plants';
    }
    if (themeId === 'matter') {
      names.ch1 = 'Chapter 1: States of Matter';
      names.ch2 = 'Chapter 2: Changes of State';
    }
    if (themeId === 'magnets') {
      names.ch1 = 'Chapter 1: Properties of Magnets';
      names.ch2 = 'Chapter 2: Uses of Magnets';
    }
    if (themeId === 'measurement') {
      if (names.ch1) names.ch1 = 'Chapter 1: Length & Distance';
      if (names.ch2) names.ch2 = 'Chapter 2: Mass';
      if (names.ch3) names.ch3 = 'Chapter 3: Volume & Capacity';
      if (names.length) names.length = 'Length & Distance';
      if (names.mass) names.mass = 'Mass';
      if (names.volume) names.volume = 'Volume & Capacity';
    }
    if (themeId === 'money') {
      names.ch1 = 'Chapter 1: Addition & Subtraction of Money';
      names.ch2 = 'Chapter 2: Word Problems with Money';
    }
    if (themeId === 'decimals') {
      names.ch1 = 'Chapter 1: Understanding Decimals';
      names.ch2 = 'Chapter 2: Comparing & Ordering Decimals';
      names.ch3 = 'Chapter 3: Operations with Decimals';
    }
    if (themeId === 'vocabcloze') {
      names.ch1 = 'Everyday Words';
      names.ch2 = 'Descriptive Words';
      names.ch3 = 'Action Words';
    }
    return names;
  }
};
