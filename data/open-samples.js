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
      },
      {
        type: "open",
        q: "Explain how the leaves of a plant make food. State what the plant needs and what is produced.",
        model_answer: "Leaves use sunlight as energy, together with water (taken in by the roots) and carbon dioxide (taken in from the air), to make food (sugar) for the plant. Oxygen is released as a by-product. This process is called photosynthesis.",
        rubric: "Award up to 4 marks: (1) sunlight is the energy source; (2) water is needed (from the roots); (3) carbon dioxide is needed (from the air); (4) sugar / food is made and oxygen is given off. Naming the process 'photosynthesis' is a bonus but not required.",
        max_marks: 4
      },
      {
        type: "open",
        q: "Why is it important that we chew our food properly before swallowing? Give two reasons.",
        model_answer: "Chewing breaks the food into smaller pieces, which makes it easier and safer to swallow. Smaller pieces also have a larger surface area, so digestive juices in the stomach and small intestine can break the food down more quickly and absorb nutrients more easily.",
        rubric: "Award up to 2 marks: (1) chewing breaks food into smaller pieces, making it easier or safer to swallow; (2) smaller pieces are digested / broken down by digestive juices more easily / faster.",
        max_marks: 2
      },
      {
        type: "open",
        q: "Describe how oxygen from the air ends up reaching the muscles in your leg. Mention at least three body parts.",
        model_answer: "Air enters through the nose and travels down the trachea (windpipe) into the lungs. In the lungs, oxygen passes from the air into the blood. The heart pumps the oxygen-rich blood through blood vessels to all parts of the body, including the muscles in the leg.",
        rubric: "Award up to 4 marks: (1) air enters through the nose / mouth; (2) air travels down the trachea (windpipe) to the lungs; (3) oxygen passes from the lungs into the blood; (4) the heart pumps the blood (through blood vessels) to the leg muscles.",
        max_marks: 4
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
      },
      {
        type: "open",
        q: "Wet clothes hung outside on a sunny, windy day dry much faster than wet clothes hung indoors. Explain why, using the idea of evaporation.",
        model_answer: "On a sunny day, heat from the Sun gives water in the clothes more energy, so the water evaporates faster (turns from a liquid into water vapour). On a windy day, the wind blows the water vapour away from the clothes, so more water can keep evaporating. Indoors, with less heat and no wind, evaporation is slower.",
        rubric: "Award up to 3 marks: (1) heat from the Sun gives water more energy to evaporate; (2) wind carries the water vapour away from the surface, allowing more evaporation; (3) indoors there is less heat and/or no moving air, so evaporation is slower.",
        max_marks: 3
      },
      {
        type: "open",
        q: "Explain why a metal lid that is stuck on a glass jar can sometimes be loosened by running it under hot water.",
        model_answer: "The hot water heats up the metal lid. Metal expands (gets slightly bigger) when it is heated, and it expands more than the glass jar. This makes the lid slightly bigger, so it loosens its grip on the jar and can be opened more easily.",
        rubric: "Award up to 3 marks: (1) the hot water heats the metal lid; (2) metal expands when heated; (3) the lid expands more than the glass / loosens its grip and can be opened.",
        max_marks: 3
      },
      {
        type: "open",
        q: "An ice cube is placed on a table at room temperature. Describe what happens to the ice cube and explain the change of state taking place.",
        model_answer: "Heat from the warmer surroundings flows into the ice cube. The ice cube gains heat and melts, changing from a solid into a liquid (water). After more time, the water may also start to evaporate slowly into water vapour.",
        rubric: "Award up to 3 marks: (1) heat flows from the warmer surroundings into the ice cube; (2) the ice melts / changes from a solid to a liquid; (3) any further detail, e.g. it gains heat / continues until it is fully melted / water may evaporate. Accept any 3 distinct ideas.",
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
      },
      {
        type: "open",
        q: "Describe the four stages in the life cycle of a butterfly. State briefly what happens at each stage.",
        model_answer: "Stage 1 — Egg: a female butterfly lays eggs on a leaf. Stage 2 — Larva (caterpillar): the egg hatches into a caterpillar that eats leaves and grows quickly. Stage 3 — Pupa (chrysalis): the caterpillar forms a hard outer covering and changes its body inside. Stage 4 — Adult butterfly: the adult comes out of the pupa, can fly, and will lay eggs to begin the cycle again.",
        rubric: "Award up to 4 marks, one per correctly named and described stage: (1) egg — laid by adult / on a leaf; (2) larva / caterpillar — eats leaves, grows; (3) pupa / chrysalis — body changes inside a covering; (4) adult butterfly — emerges, flies, lays eggs.",
        max_marks: 4
      },
      {
        type: "open",
        q: "Explain what happens to rainwater after it falls to the ground, using ideas from the water cycle.",
        model_answer: "Some rainwater collects in puddles, drains, rivers, lakes, and the sea. Some of it soaks into the soil and becomes groundwater that plants can absorb through their roots. Heat from the Sun causes water at the surface to evaporate back into the air as water vapour, which condenses into clouds and falls again as rain.",
        rubric: "Award up to 3 marks: (1) rainwater collects in rivers / lakes / sea / soaks into the ground; (2) the Sun's heat causes evaporation back into water vapour; (3) water vapour condenses into clouds and the cycle continues / it falls again as rain.",
        max_marks: 3
      },
      {
        type: "open",
        q: "A coconut tree growing on the shore of an island is found to have a young coconut tree growing on a different island far away across the sea. Explain how the seed most likely got there.",
        model_answer: "The coconut was dispersed by water. Coconuts have a tough, waterproof outer shell and an air space inside, so they can float for a long time. The coconut floated across the sea from the parent tree, was washed up on the new island's shore, and germinated there into a young coconut tree.",
        rubric: "Award up to 3 marks: (1) the coconut was dispersed by water; (2) it can float because of its tough waterproof shell / air space inside; (3) it floated across the sea, was washed up on the new island, and germinated.",
        max_marks: 3
      }
    ]
  });
}
