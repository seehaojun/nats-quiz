// Data loader — merges theme data and provides navigation
window.QUIZ_DATA = window.QUIZ_DATA || {};

var QuizLoader = {
  themes: {
    diversity: { name: 'Diversity', icon: '🌿', color: 'diversity', description: 'Living & non-living things, plants, classification' },
    cycles: { name: 'Cycles', icon: '🔄', color: 'cycles', description: 'Water cycle, life cycles of plants & animals' },
    systems: { name: 'Systems', icon: '⚙️', color: 'systems', description: 'Human body, plant transport, electrical circuits' },
    energy: { name: 'Energy', icon: '⚡', color: 'energy', description: 'Light, heat, forces, photosynthesis' },
    interactions: { name: 'Interactions', icon: '🤝', color: 'interactions', description: 'Food chains, adaptations, environment' }
  },

  getThemeData: function(themeId) {
    return window.QUIZ_DATA[themeId] || null;
  },

  getThemeQuestionCount: function(themeId) {
    var data = this.getThemeData(themeId);
    if (!data) return 0;
    var total = 0;
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        total += data[key].length;
      }
    }
    return total;
  },

  isThemeLoaded: function(themeId) {
    return !!window.QUIZ_DATA[themeId];
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

  // Get category display names for a theme
  getCategoryNames: function(themeId) {
    var data = this.getThemeData(themeId);
    if (!data) return {};
    var names = {};
    for (var key in data) {
      if (!data.hasOwnProperty(key)) continue;
      // Default names based on common patterns
      if (key === 'tricky') names[key] = 'Tricky Questions';
      else if (key === 'notqs') names[key] = 'Which Is NOT? Questions';
      else if (key === 'apply') names[key] = 'Application & Thinking Questions';
      else if (key === 'plantsys') names[key] = 'Plant Parts & Functions';
      else if (key === 'hard') names[key] = 'Hard Questions';
      else if (key === 'compare') names[key] = 'Comparison Questions';
      else if (key.startsWith('ch')) names[key] = 'Chapter ' + key.replace('ch', '');
      else names[key] = key;
    }
    // Theme-specific overrides
    if (themeId === 'diversity') {
      names.ch1 = 'Chapter 1: Classifying Things';
      names.ch2 = 'Chapter 2: Living & Non-Living Things';
      names.ch3 = 'Chapter 3: Plants';
    }
    return names;
  }
};
