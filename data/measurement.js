window.QUIZ_DATA = window.QUIZ_DATA || {};
window.QUIZ_DATA.measurement = {

length: [
  { q: "How many centimetres are in 3 metres?", opts: ["300 cm", "30 cm", "3000 cm", "3 cm"], ans: 0, explain: "1 m = 100 cm. 3 x 100 = 300 cm." },
  { q: "Convert 5 km 200 m to metres.", opts: ["5200 m", "5020 m", "52 000 m", "520 m"], ans: 0, explain: "5 km = 5000 m. 5000 + 200 = 5200 m." },
  { q: "How many millimetres are in 8 cm?", opts: ["80 mm", "800 mm", "8 mm", "0.8 mm"], ans: 0, explain: "1 cm = 10 mm. 8 x 10 = 80 mm." },
  { q: "What is 4600 m in kilometres and metres?", opts: ["4 km 600 m", "46 km 0 m", "4 km 60 m", "460 km 0 m"], ans: 0, explain: "4600 / 1000 = 4 remainder 600. So 4 km 600 m." },
  { q: "A ribbon is 2 m 35 cm long. What is this in centimetres?", opts: ["235 cm", "2035 cm", "2350 cm", "23.5 cm"], ans: 0, explain: "2 m = 200 cm. 200 + 35 = 235 cm." },
  { q: "Convert 7500 m to km and m.", opts: ["7 km 500 m", "75 km 0 m", "7 km 50 m", "750 km 0 m"], ans: 0, explain: "7500 / 1000 = 7 remainder 500. So 7 km 500 m." },
  { q: "How many centimetres are in 3 m 7 cm?", opts: ["307 cm", "370 cm", "37 cm", "3007 cm"], ans: 0, explain: "3 m = 300 cm. 300 + 7 = 307 cm." },
  { q: "A piece of wire is 95 mm long. How long is it in centimetres and millimetres?", opts: ["9 cm 5 mm", "95 cm 0 mm", "0 cm 95 mm", "90 cm 5 mm"], ans: 0, explain: "95 / 10 = 9 remainder 5. So 9 cm 5 mm." },
  { q: "Ali walks 1 km 300 m to school and 1 km 300 m back home. What is the total distance?", opts: ["2 km 600 m", "2 km 300 m", "1 km 600 m", "26 km"], ans: 0, explain: "1 km 300 m + 1 km 300 m = 2 km 600 m." },
  { q: "A table is 180 cm long. What is this in metres and centimetres?", opts: ["1 m 80 cm", "18 m 0 cm", "1 m 8 cm", "0 m 180 cm"], ans: 0, explain: "180 / 100 = 1 remainder 80. So 1 m 80 cm." },
  { q: "How many metres are in 6 km?", opts: ["6000 m", "600 m", "60 m", "60 000 m"], ans: 0, explain: "1 km = 1000 m. 6 x 1000 = 6000 m." },
  { q: "A pencil is 14 cm 3 mm long. What is this in millimetres?", opts: ["143 mm", "1430 mm", "14.3 mm", "1043 mm"], ans: 0, explain: "14 cm = 140 mm. 140 + 3 = 143 mm." },
  { q: "Siti runs 2 km 450 m. How many metres is that?", opts: ["2450 m", "2045 m", "24 500 m", "245 m"], ans: 0, explain: "2 km = 2000 m. 2000 + 450 = 2450 m." },
  { q: "A rope is 4 m long. Ravi cuts off 1 m 60 cm. How much rope is left?", opts: ["2 m 40 cm", "3 m 40 cm", "2 m 60 cm", "3 m 60 cm"], ans: 0, explain: "4 m = 400 cm. 400 - 160 = 240 cm = 2 m 40 cm." },
  { q: "What is 530 cm in metres and centimetres?", opts: ["5 m 30 cm", "53 m 0 cm", "5 m 3 cm", "0 m 530 cm"], ans: 0, explain: "530 / 100 = 5 remainder 30. So 5 m 30 cm." }
],

mass: [
  { q: "How many grams are in 4 kg?", opts: ["4000 g", "400 g", "40 g", "40 000 g"], ans: 0, explain: "1 kg = 1000 g. 4 x 1000 = 4000 g." },
  { q: "Convert 3500 g to kg and g.", opts: ["3 kg 500 g", "35 kg 0 g", "3 kg 50 g", "350 kg 0 g"], ans: 0, explain: "3500 / 1000 = 3 remainder 500. So 3 kg 500 g." },
  { q: "A watermelon weighs 3 kg 250 g. What is this in grams?", opts: ["3250 g", "32 500 g", "325 g", "3025 g"], ans: 0, explain: "3 kg = 3000 g. 3000 + 250 = 3250 g." },
  { q: "A bag of rice weighs 5 kg. A bag of flour weighs 2 kg 300 g. What is the total mass?", opts: ["7 kg 300 g", "7 kg 30 g", "52 kg 300 g", "7 kg 3 g"], ans: 0, explain: "5 kg + 2 kg 300 g = 7 kg 300 g." },
  { q: "Mei Ling buys 4 packets of sugar, each weighing 500 g. What is the total mass in kg?", opts: ["2 kg", "20 kg", "200 g", "2 kg 500 g"], ans: 0, explain: "4 x 500 = 2000 g = 2 kg." },
  { q: "A parcel weighs 1 kg 400 g. Another parcel weighs 650 g. What is the total mass?", opts: ["2 kg 50 g", "2 kg 500 g", "1 kg 1050 g", "2 kg 5 g"], ans: 0, explain: "1400 g + 650 g = 2050 g = 2 kg 50 g." },
  { q: "How many grams are in 2.5 kg?", opts: ["2500 g", "250 g", "25 g", "25 000 g"], ans: 0, explain: "2.5 x 1000 = 2500 g." },
  { q: "A chicken weighs 1 kg 900 g. A duck weighs 2 kg 500 g. How much heavier is the duck?", opts: ["600 g", "1 kg 600 g", "400 g", "1 kg"], ans: 0, explain: "2500 g - 1900 g = 600 g." },
  { q: "Convert 5030 g to kg and g.", opts: ["5 kg 30 g", "50 kg 30 g", "5 kg 300 g", "503 kg 0 g"], ans: 0, explain: "5030 / 1000 = 5 remainder 30. So 5 kg 30 g." },
  { q: "Uncle Lee buys 3 packets of bee hoon, each weighing 600 g. What is the total mass in kg and g?", opts: ["1 kg 800 g", "1800 kg", "18 kg 0 g", "1 kg 80 g"], ans: 0, explain: "3 x 600 = 1800 g = 1 kg 800 g." },
  { q: "A tin of cookies weighs 450 g when full and 150 g when empty. What is the mass of the cookies?", opts: ["300 g", "600 g", "450 g", "150 g"], ans: 0, explain: "450 - 150 = 300 g." },
  { q: "What is 3 kg 80 g in grams?", opts: ["3080 g", "3800 g", "380 g", "30 800 g"], ans: 0, explain: "3 kg = 3000 g. 3000 + 80 = 3080 g." },
  { q: "A bag of potatoes weighs 4 kg. Ravi uses 1 kg 650 g. How much is left?", opts: ["2 kg 350 g", "2 kg 650 g", "3 kg 350 g", "1 kg 350 g"], ans: 0, explain: "4000 g - 1650 g = 2350 g = 2 kg 350 g." },
  { q: "Which is heavier: 3200 g or 3 kg 20 g?", opts: ["3200 g", "3 kg 20 g", "They are equal", "Cannot tell"], ans: 0, explain: "3 kg 20 g = 3020 g. 3200 g > 3020 g. So 3200 g is heavier." },
  { q: "Ali weighs 28 kg 500 g. His bag weighs 3 kg 200 g. What is their total mass?", opts: ["31 kg 700 g", "31 kg 70 g", "32 kg 700 g", "28 kg 700 g"], ans: 0, explain: "28 kg 500 g + 3 kg 200 g = 31 kg 700 g." }
],

volume: [
  { q: "How many millilitres are in 3 litres?", opts: ["3000 ml", "300 ml", "30 ml", "30 000 ml"], ans: 0, explain: "1 l = 1000 ml. 3 x 1000 = 3000 ml." },
  { q: "Convert 4200 ml to litres and millilitres.", opts: ["4 l 200 ml", "42 l 0 ml", "4 l 20 ml", "420 l 0 ml"], ans: 0, explain: "4200 / 1000 = 4 remainder 200. So 4 l 200 ml." },
  { q: "A bottle holds 1 l 350 ml of water. What is this in millilitres?", opts: ["1350 ml", "13 500 ml", "135 ml", "1035 ml"], ans: 0, explain: "1 l = 1000 ml. 1000 + 350 = 1350 ml." },
  { q: "A jug holds 2 l of water. Siti pours out 850 ml. How much water is left?", opts: ["1 l 150 ml", "1 l 850 ml", "1150 l", "850 ml"], ans: 0, explain: "2000 ml - 850 ml = 1150 ml = 1 l 150 ml." },
  { q: "How many millilitres are in 3.5 litres?", opts: ["3500 ml", "350 ml", "35 ml", "35 000 ml"], ans: 0, explain: "3.5 x 1000 = 3500 ml." },
  { q: "A measuring cup shows 700 ml of water. Ravi adds 550 ml more. How much water is there now?", opts: ["1250 ml", "1500 ml", "150 ml", "1 l 500 ml"], ans: 0, explain: "700 + 550 = 1250 ml." },
  { q: "Convert 6050 ml to litres and millilitres.", opts: ["6 l 50 ml", "60 l 50 ml", "6 l 500 ml", "605 l 0 ml"], ans: 0, explain: "6050 / 1000 = 6 remainder 50. So 6 l 50 ml." },
  { q: "A tank contains 7 l 400 ml of water. 2 l 600 ml is used. How much is left?", opts: ["4 l 800 ml", "5 l 800 ml", "4 l 200 ml", "10 l 0 ml"], ans: 0, explain: "7400 ml - 2600 ml = 4800 ml = 4 l 800 ml." },
  { q: "Ali fills 8 cups with 250 ml of juice each. How much juice does he use in litres?", opts: ["2 l", "20 l", "200 ml", "1 l 500 ml"], ans: 0, explain: "8 x 250 = 2000 ml = 2 l." },
  { q: "A container holds 5 l of milk. Mei pours the milk equally into 4 bottles. How much milk is in each bottle?", opts: ["1 l 250 ml", "1 l 200 ml", "1000 ml", "500 ml"], ans: 0, explain: "5 l = 5000 ml. 5000 / 4 = 1250 ml = 1 l 250 ml." },
  { q: "What is 2 l 60 ml in millilitres?", opts: ["2060 ml", "2600 ml", "260 ml", "20 600 ml"], ans: 0, explain: "2 l = 2000 ml. 2000 + 60 = 2060 ml." },
  { q: "A fish tank holds 8 l of water. 3 l 200 ml evaporates. How much water is left?", opts: ["4 l 800 ml", "4 l 200 ml", "5 l 200 ml", "11 l 200 ml"], ans: 0, explain: "8000 ml - 3200 ml = 4800 ml = 4 l 800 ml." },
  { q: "How many 250 ml cups can be filled from a 2 l bottle?", opts: ["8", "5", "4", "10"], ans: 0, explain: "2 l = 2000 ml. 2000 / 250 = 8 cups." },
  { q: "A recipe needs 1 l 500 ml of water. Mrs Tan makes 2 batches. How much water does she need?", opts: ["3 l", "3 l 500 ml", "2 l 500 ml", "1 l 500 ml"], ans: 0, explain: "2 x 1500 ml = 3000 ml = 3 l." },
  { q: "Which holds more: 3 l 80 ml or 3800 ml?", opts: ["3800 ml", "3 l 80 ml", "They are equal", "Cannot tell"], ans: 0, explain: "3 l 80 ml = 3080 ml. 3800 ml > 3080 ml. So 3800 ml holds more." }
],

tricky: [
  { q: "A wire is 4 m 20 cm long. It is cut into 6 equal pieces. How long is each piece?", opts: ["70 cm", "4 m 14 cm", "42 cm", "7 cm"], ans: 0, explain: "4 m 20 cm = 420 cm. 420 / 6 = 70 cm." },
  { q: "A bag of flour weighs 3 kg 200 g. Mrs Lee uses 3/4 of it. How much flour did she use?", opts: ["2 kg 400 g", "1 kg 600 g", "800 g", "2 kg 100 g"], ans: 0, explain: "3 kg 200 g = 3200 g. 3/4 x 3200 = 2400 g = 2 kg 400 g." },
  { q: "Ravi jogs 1 km 600 m on Monday and 2 km 850 m on Tuesday. How far did he jog altogether?", opts: ["4 km 450 m", "3 km 450 m", "4 km 150 m", "3 km 850 m"], ans: 0, explain: "1600 m + 2850 m = 4450 m = 4 km 450 m." },
  { q: "A jug holds 1 l 200 ml. Mei Ling fills 5 such jugs. How much water is that?", opts: ["6 l", "6 l 200 ml", "60 l", "5 l 200 ml"], ans: 0, explain: "5 x 1200 ml = 6000 ml = 6 l." },
  { q: "Ali buys 4 kg of chicken. The chicken is packed into 8 equal portions. What is the mass of each portion?", opts: ["500 g", "400 g", "250 g", "600 g"], ans: 0, explain: "4 kg = 4000 g. 4000 / 8 = 500 g." },
  { q: "A plank is 5 m long. Siti cuts off 1 m 70 cm. She then cuts off another 90 cm. How much is left?", opts: ["2 m 40 cm", "3 m 40 cm", "2 m 60 cm", "3 m 10 cm"], ans: 0, explain: "5 m = 500 cm. 500 - 170 - 90 = 240 cm = 2 m 40 cm." },
  { q: "A bottle of oil holds 600 ml. How many bottles are needed to fill a 3 l container?", opts: ["5", "4", "6", "3"], ans: 0, explain: "3 l = 3000 ml. 3000 / 600 = 5 bottles." },
  { q: "The total mass of 4 identical books is 2 kg 800 g. What is the mass of each book?", opts: ["700 g", "600 g", "800 g", "280 g"], ans: 0, explain: "2 kg 800 g = 2800 g. 2800 / 4 = 700 g." },
  { q: "A tank has 8 l of water. Siti pours out 1 l 500 ml, then adds 2 l 300 ml. How much water is in the tank now?", opts: ["8 l 800 ml", "9 l 800 ml", "7 l 800 ml", "8 l 200 ml"], ans: 0, explain: "8000 - 1500 + 2300 = 8800 ml = 8 l 800 ml." },
  { q: "A ribbon is 5 m 60 cm long. It is cut into pieces that are each 70 cm long. How many pieces can she get?", opts: ["8", "7", "9", "6"], ans: 0, explain: "5 m 60 cm = 560 cm. 560 / 70 = 8 pieces." }
]

};
