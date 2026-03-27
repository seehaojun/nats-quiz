# P4 Quiz App -- Accuracy Report

**Date:** 2026-03-27
**Scope:** All 17 data files in `/data/` verified question-by-question.

## Summary

- **Total files reviewed:** 17 (Science: 5, English: 4, Math: 4, Chinese: 4)
- **Total errors found and fixed:** 3

All other questions across all 17 files were verified as accurate.

---

## Errors Found and Fixed

### Error 1 -- geometry.js, line 58 (ch3)

**Question:** "What is the perimeter of an L-shaped figure made of two rectangles: one 10 cm x 4 cm and one 6 cm x 4 cm joined along the 4 cm side?"

**Wrong answer:** 40 cm

**Correct answer:** 36 cm

**Calculation work:**
The L-shape has the 10 cm rectangle on top and the 6 cm rectangle on the bottom, joined along a 4 cm vertical side. Tracing the outer perimeter:
- Top: 10 cm (right)
- Down right side: 4 cm
- Step left (10 - 6): 4 cm
- Down: 4 cm
- Bottom left: 6 cm
- Up left side (4 + 4): 8 cm
- **Total: 10 + 4 + 4 + 4 + 6 + 8 = 36 cm**

The original explanation itself calculated 36 cm in its working but then contradicted itself with "Correct answer: The perimeter is 40 cm."

**Fix applied:** Swapped opts[0] and opts[1] so "36 cm" is the correct answer. Rewrote explanation to be clear and consistent.

---

### Error 2 -- tables.js, line 51 (tricky)

**Question:** "A line graph shows increasing temperatures. At 8 am it is 26 degrees C and at 2 pm it is 35 degrees C. Estimate the temperature at 11 am if the increase is steady."

**Wrong answer:** 29.5 degrees C

**Correct answer:** 30.5 degrees C

**Calculation work:**
- Temperature rise: 35 - 26 = 9 degrees C
- Time span: 8 am to 2 pm = 6 hours
- Rate: 9 / 6 = 1.5 degrees C per hour
- At 11 am (3 hours after 8 am): 26 + (1.5 x 3) = 26 + 4.5 = **30.5 degrees C**

The original explanation computed 30.5 degrees C correctly but then said "Closest is 29.5 degrees C" -- a self-contradiction.

**Fix applied:** Changed opts[0] from "29.5 degrees C" to "30.5 degrees C". Removed the contradictory "Closest is" phrasing from the explanation.

---

### Error 3 -- interactions.js, line 115 (hard)

**Question:** "A food web shows: grass -> grasshopper -> lizard -> hawk and grass -> grasshopper -> frog -> snake -> hawk. The hawk is a ________."

**Wrong answer:** "Secondary consumer in one chain and a tertiary consumer in another"

**Correct answer:** "Tertiary consumer in one chain and a quaternary consumer in another"

**Analysis:**
- Chain 1: grass (producer) -> grasshopper (primary consumer) -> lizard (secondary consumer) -> hawk (**tertiary consumer**)
- Chain 2: grass (producer) -> grasshopper (primary consumer) -> frog (secondary consumer) -> snake (tertiary consumer) -> hawk (**quaternary consumer**)

The original explanation correctly identified the hawk as a "3rd-level consumer" and "4th-level consumer" but the answer text was off by one level in both cases: it said "secondary" (2nd) instead of "tertiary" (3rd) and "tertiary" (3rd) instead of "quaternary" (4th).

**Fix applied:** Changed opts[0] to "Tertiary consumer in one chain and a quaternary consumer in another". Expanded the explanation for clarity.

---

## Notes on Reviewed Content (No Errors)

### Math (4 files, ~500 questions)
- **wholenumbers.js** -- All place value, rounding, arithmetic (multiplication and division), factors, multiples, and prime number questions verified. Every computation confirmed correct.
- **fractions.js** -- All fraction addition/subtraction, decimal conversions, and word problems verified. Note: ch2 line 29 gives 4/8 as the answer for 7/8 - 3/8 rather than simplifying to 1/2, but the explanation mentions both forms. Acceptable for P4.
- **geometry.js** -- All angle, symmetry, area, and perimeter questions verified (except the L-shape error above, now fixed).
- **tables.js** -- All table, bar graph, and line graph interpretation questions verified (except the temperature error above, now fixed).

### Science (5 files, ~700+ questions)
- **diversity.js** -- Classification, living/non-living, plant groups, and plant systems all factually sound per P4 MOE syllabus.
- **cycles.js** -- Water cycle, life cycles, and plant reproduction content verified.
- **systems.js** -- Digestive, respiratory/circulatory, plant transport, and electrical circuits content verified.
- **energy.js** -- Light, heat, photosynthesis, food chains, and forces content verified.
- **interactions.js** -- Food chains/webs, adaptations, human impact, and conservation content verified (except the hawk consumer level error above, now fixed).

### English (4 files, ~400+ questions)
- **grammar.js** -- Tenses, parts of speech, and sentence structure all correct. Note: line 90 "Neither my brother nor I ___ able to solve the puzzle" with answer "was" is defensible in formal British English grammar (the verb agrees with the nearer subject "I" -> "was" in formal usage, though "were" is also accepted informally).
- **vocabulary.js** -- Word meanings, synonyms/antonyms, and phrasal verbs/idioms verified.
- **comprehension.js** -- Main idea, detail, and inference questions verified.
- **synthesis.js** -- Sentence combining and transformation questions verified.

### Chinese (4 files, ~350+ questions)
- **hanzi.js** -- Character recognition, synonyms/antonyms, and measure words verified. No character typos detected.
- **yufa.js** -- Sentence structure, connectors, and punctuation verified.
- **cloze.js** -- Word choice and context understanding verified.
- **yuedu.js** -- Short passage comprehension and inference verified.
