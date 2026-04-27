// Open-ended sample questions for P4 Science.
// These attach to existing themes via Object.assign so they show up under each
// theme as "Open-Ended Questions" alongside the chapter MCQ topics.
//
// Schema:
//   { type: "open", q, model_answer, rubric, max_marks }
//
// Submitted answers are sent to a serverless grader (see /vercel) which calls
// Claude to score them against the rubric and return structured feedback.
// If the grader is unreachable, the UI shows the model_answer + manual self-grade.

window.QUIZ_DATA = window.QUIZ_DATA || {};

if (window.QUIZ_DATA.systems) {
  Object.assign(window.QUIZ_DATA.systems, {
    open: [
      {
        type: "open",
        q: "Explain why a plant wilts when it does not receive enough water. Include what happens inside the plant.",
        model_answer: "When a plant does not get enough water, its cells lose water and become less firm (less turgid). Without firm cells, the stem and leaves can no longer stay upright, so the plant droops and wilts.",
        rubric: "Award 1 mark each for: (1) cells lose water / become less turgid; (2) cells / stem are no longer firm or rigid; (3) the plant droops or wilts as a result. Accept equivalent wording.",
        max_marks: 3
      },
      {
        type: "open",
        q: "Describe what happens to a piece of bread from the moment it enters the mouth until the nutrients reach the body's cells. Mention at least three organs.",
        model_answer: "In the mouth, teeth chew the bread into smaller pieces and saliva mixes with it. The bread is swallowed and travels down the oesophagus to the stomach, where it is churned with digestive juices. The mixture then moves into the small intestine, where digested nutrients are absorbed into the blood. Blood carries the nutrients to all the body's cells.",
        rubric: "Award up to 4 marks: (1) mouth chews / saliva starts breaking down food; (2) oesophagus carries food to stomach; (3) stomach churns food with digestive juices; (4) small intestine absorbs nutrients into the blood, which carries them to cells. Accept any 4 of these ideas in any order.",
        max_marks: 4
      },
      {
        type: "open",
        q: "After running a race, Nat notices that he is breathing faster and his heart is beating faster. Explain why both his breathing and his heart rate increase.",
        model_answer: "When Nat runs, his muscles need more energy, so they need more oxygen and produce more carbon dioxide. He breathes faster to take in more oxygen and remove more carbon dioxide. His heart beats faster to pump the oxygen-rich blood to his muscles more quickly.",
        rubric: "Award up to 3 marks: (1) muscles need more oxygen and/or produce more carbon dioxide during exercise; (2) faster breathing brings in more oxygen / removes more carbon dioxide; (3) faster heartbeat pumps blood (with oxygen and nutrients) to muscles more quickly.",
        max_marks: 3
      }
    ]
  });
}

if (window.QUIZ_DATA.matter) {
  Object.assign(window.QUIZ_DATA.matter, {
    open: [
      {
        type: "open",
        q: "A glass of cold water is left on a table. After a while, water droplets appear on the outside of the glass. Where did these droplets come from? Explain using the idea of changes in state.",
        model_answer: "The droplets come from water vapour in the air around the glass. The cold glass cools the water vapour, which loses heat and condenses (changes from a gas to a liquid) on the outside of the glass.",
        rubric: "Award up to 3 marks: (1) the droplets come from water vapour in the surrounding air (not from inside the glass); (2) the cold glass cools the water vapour / the water vapour loses heat; (3) the water vapour condenses (gas to liquid) on the outside of the glass.",
        max_marks: 3
      },
      {
        type: "open",
        q: "Compare the way the particles are arranged in a solid, a liquid and a gas.",
        model_answer: "In a solid, the particles are packed closely together in a fixed pattern and can only vibrate in place. In a liquid, the particles are still close together but they can slide past each other, so a liquid can flow. In a gas, the particles are very far apart and move quickly in all directions, so a gas spreads out to fill its container.",
        rubric: "Award 1 mark for each clearly described state: (1) solid — closely packed, fixed positions; (2) liquid — close together but can slide / flow; (3) gas — far apart and move freely / spread out.",
        max_marks: 3
      }
    ]
  });
}

if (window.QUIZ_DATA.cycles) {
  Object.assign(window.QUIZ_DATA.cycles, {
    open: [
      {
        type: "open",
        q: "A butterfly and a cockroach both lay eggs but their life cycles are classified differently. Explain the key difference between their life cycles.",
        model_answer: "A butterfly undergoes complete metamorphosis with 4 stages: egg, larva (caterpillar), pupa and adult. The young (caterpillar) looks very different from the adult. A cockroach undergoes incomplete metamorphosis with only 3 stages: egg, nymph and adult. The cockroach has no pupa stage, and the nymph already looks like a small version of the adult.",
        rubric: "Award up to 4 marks: (1) butterfly has 4 stages including a pupa (complete metamorphosis); (2) cockroach has 3 stages with no pupa (incomplete metamorphosis); (3) butterfly's young (caterpillar/larva) looks very different from the adult; (4) cockroach's young (nymph) looks like a smaller version of the adult.",
        max_marks: 4
      },
      {
        type: "open",
        q: "Explain why seed dispersal is important for a flowering plant.",
        model_answer: "Seed dispersal spreads seeds away from the parent plant. This means the new young plants do not have to compete with the parent plant or each other for sunlight, water, minerals and space. As a result, more seeds have a chance to grow into healthy plants in new places.",
        rubric: "Award up to 3 marks: (1) seeds are spread away from the parent plant; (2) reduces competition for sunlight, water, minerals or space; (3) more seeds can grow / colonise new places.",
        max_marks: 3
      },
      {
        type: "open",
        q: "Describe the three things a seed needs in order to germinate. For each one, explain briefly why it is needed.",
        model_answer: "A seed needs water to soften the seed coat and help the embryo inside start to grow. It needs air (oxygen) so the seed can use its food store to release energy for growth. It also needs the right temperature (warmth) so that germination can take place. Sunlight is not needed for germination itself.",
        rubric: "Award up to 3 marks, one for each correctly named factor with a sensible reason: (1) water — softens seed coat / activates the embryo; (2) air / oxygen — needed for the seed to release energy; (3) suitable temperature / warmth — needed for germination to happen. Deduct nothing if student also mentions that sunlight is not needed.",
        max_marks: 3
      }
    ]
  });
}
