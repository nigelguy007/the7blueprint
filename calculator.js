// =============================================================================
// THE BLUEPRINT METHOD — CALCULATOR
// Pure JS port of the spec's BlueprintCalculator class.
// No dependencies. Runs in any browser, any Node.
// =============================================================================

(function (global) {
  'use strict';

  // Pythagorean letter-to-number mapping (standard numerology)
  const PYTHAGOREAN_MAP = {
    a: 1, j: 1, s: 1,
    b: 2, k: 2, t: 2,
    c: 3, l: 3, u: 3,
    d: 4, m: 4, v: 4,
    e: 5, n: 5, w: 5,
    f: 6, o: 6, x: 6,
    g: 7, p: 7, y: 7,
    h: 8, q: 8, z: 8,
    i: 9, r: 9
  };

  // Map a "seen" number to its corresponding "unseen" number
  const UNSEEN_MAP = {
    1: 9, 2: 8, 3: 7, 4: 6, 5: 10,
    6: 4, 7: 3, 8: 2, 9: 1, 10: 5, 11: 0  // 11 -> 0 (originally "0(8)")
  };

  // Reduce a number to <= 11 (master numbers preserved)
  function reduceTo11OrLess(n) {
    while (n > 11) {
      n = String(n).split('').reduce((a, b) => a + Number(b), 0);
    }
    return n;
  }

  // ---------------------------------------------------------------------------
  // CHART CALCULATION
  // ---------------------------------------------------------------------------

  function calculateSeenNumbers(day, month, year) {
    const d = String(day).padStart(2, '0').split('').map(Number);
    const m = String(month).padStart(2, '0').split('').map(Number);
    const y = String(year).padStart(4, '0').split('').map(Number);

    return {
      soul:    reduceTo11OrLess(d[0] + d[1]),
      karma:   reduceTo11OrLess(m[0] + m[1]),
      destiny: reduceTo11OrLess(y[0] + y[1] + y[2] + y[3]),
      gift:    reduceTo11OrLess(y[2] + y[3]),
      path:    reduceTo11OrLess(d[0] + d[1] + m[0] + m[1] + y[0] + y[1] + y[2] + y[3])
    };
  }

  function calculateUnseenNumbers(seen) {
    return {
      people:    UNSEEN_MAP[seen.soul],
      shadow:    UNSEEN_MAP[seen.karma],
      hiddenKey: UNSEEN_MAP[seen.destiny],
      blindspot: UNSEEN_MAP[seen.gift],
      embodiment: UNSEEN_MAP[seen.path]
    };
  }

  function calculateNameNumbers(fullName) {
    const normalized = String(fullName || '').toLowerCase().replace(/[^a-z]/g, '');
    let total = 0, vowelSum = 0;
    const vowels = 'aeiou';
    for (const ch of normalized) {
      const v = PYTHAGOREAN_MAP[ch] || 0;
      total += v;
      if (vowels.includes(ch)) vowelSum += v;
    }
    return {
      expression:  reduceTo11OrLess(total),
      soulUrge:    reduceTo11OrLess(vowelSum),
      personality: reduceTo11OrLess(total - vowelSum)
    };
  }

  function calculatePersonalYear(day, month, targetYear) {
    return reduceTo11OrLess(day + month + targetYear);
  }

  function calculateChart(day, month, year, fullName, targetYear) {
    if (typeof targetYear !== 'number') targetYear = new Date().getFullYear();
    const seen = calculateSeenNumbers(day, month, year);
    return {
      seen,
      unseen: calculateUnseenNumbers(seen),
      nameNumbers: calculateNameNumbers(fullName),
      personalYear: calculatePersonalYear(day, month, targetYear)
    };
  }

  // ---------------------------------------------------------------------------
  // BLUEPRINT CALCULATION
  // ---------------------------------------------------------------------------

  // Convert 1–5 questionnaire answer to 1–9 weighted scale
  function ans9(x) {
    return 1 + ((x - 1) * 8) / 4; // 1, 3, 5, 7, 9
  }

  // Alignment between numerology inputs and questionnaire inputs (0-100)
  function calculateAlignment(numerologyInputs, questionnaireInputs) {
    const numAvg = numerologyInputs.reduce((a, b) => a + b, 0) / numerologyInputs.length;
    const qAvg = questionnaireInputs.reduce((a, b) => a + b, 0) / questionnaireInputs.length;
    const diff = Math.abs(numAvg - qAvg);
    return Math.max(0, Math.min(100, 100 - (diff * 12)));
  }

  function calculateBlueprint(chart, responses) {
    const c = chart;
    const r = responses;
    const a = {
      visibility: ans9(r.visibility),
      structure: ans9(r.structure),
      experimentation: ans9(r.experimentation),
      depth: ans9(r.depth),
      authority: ans9(r.authority),
      capacity: ans9(r.capacity),
      nurture: ans9(r.nurture),
      teaching: ans9(r.teaching),
      complexity: ans9(r.complexity),
      premiumConfidence: ans9(r.premiumConfidence),
      proofConfidence: ans9(r.proofConfidence),
      directness: ans9(r.directness)
    };

    const u = c.unseen;
    const n = c.nameNumbers;
    const s = c.seen;

    const marketEntry = reduceTo11OrLess(
      2 * s.path + s.soul + Number(u.people) +
      a.visibility + a.experimentation + a.directness
    );

    const offer = reduceTo11OrLess(
      2 * s.gift + n.soulUrge + Number(u.hiddenKey) +
      a.depth + a.teaching + a.premiumConfidence
    );

    const delivery = reduceTo11OrLess(
      2 * Number(u.embodiment) + s.karma + Number(u.blindspot) +
      a.capacity + a.structure + a.depth
    );

    const pathway = reduceTo11OrLess(
      2 * s.destiny + s.path + n.personality +
      a.nurture + a.structure + a.complexity
    );

    const messaging = reduceTo11OrLess(
      2 * n.expression + s.soul + Number(u.people) +
      a.authority + a.directness + a.visibility
    );

    const content = reduceTo11OrLess(
      2 * s.gift + n.personality + c.personalYear +
      a.teaching + a.structure + a.experimentation
    );

    const pricing = reduceTo11OrLess(
      2 * s.destiny + n.expression + Number(u.embodiment) +
      a.premiumConfidence + a.proofConfidence + a.authority
    );

    const friction = reduceTo11OrLess(
      s.karma + Number(u.shadow) + Number(u.blindspot)
    );

    return {
      categories: {
        market_entry_strategy: {
          score: marketEntry,
          alignment: calculateAlignment(
            [s.path, s.soul, Number(u.people)],
            [a.visibility, a.experimentation, a.directness]
          )
        },
        offer_architecture: {
          score: offer,
          alignment: calculateAlignment(
            [s.gift, n.soulUrge, Number(u.hiddenKey)],
            [a.depth, a.teaching, a.premiumConfidence]
          )
        },
        service_delivery_model: {
          score: delivery,
          alignment: calculateAlignment(
            [Number(u.embodiment), s.karma, Number(u.blindspot)],
            [a.capacity, a.structure, a.depth]
          )
        },
        conversion_pathway: {
          score: pathway,
          alignment: calculateAlignment(
            [s.destiny, s.path, n.personality],
            [a.nurture, a.structure, a.complexity]
          )
        },
        brand_messaging_framework: {
          score: messaging,
          alignment: calculateAlignment(
            [n.expression, s.soul, Number(u.people)],
            [a.authority, a.directness, a.visibility]
          )
        },
        content_strategy: {
          score: content,
          alignment: calculateAlignment(
            [s.gift, n.personality, c.personalYear],
            [a.teaching, a.structure, a.experimentation]
          )
        },
        pricing_structure: {
          score: pricing,
          alignment: calculateAlignment(
            [s.destiny, n.expression, Number(u.embodiment)],
            [a.premiumConfidence, a.proofConfidence, a.authority]
          )
        }
      },
      frictionLoad: friction,
      frictionLevel: friction <= 3 ? 'low' : (friction <= 7 ? 'medium' : 'high')
    };
  }

  // ---------------------------------------------------------------------------
  // EXPORT
  // ---------------------------------------------------------------------------

  const BlueprintCalculator = {
    calculateChart,
    calculateBlueprint,
    calculateSeenNumbers,
    calculateUnseenNumbers,
    calculateNameNumbers,
    calculatePersonalYear,
    reduceTo11OrLess
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlueprintCalculator;
  } else {
    global.BlueprintCalculator = BlueprintCalculator;
  }

})(typeof window !== 'undefined' ? window : globalThis);
