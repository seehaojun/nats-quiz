window.QUIZ_DATA = window.QUIZ_DATA || {};
window.QUIZ_DATA.sentence = {

ch1: [
  // 把字句 and 被字句 (~15 questions)
  { q: "把下面的句子改成被字句：小明把杯子打破了。", opts: ["杯子被小明打破了。", "小明被杯子打破了。", "杯子把小明打破了。", "小明打破了杯子被。"], ans: 0, explain: "被字句 pattern: [receiver] 被 [doer] [action]. The cup (杯子) was broken by Xiao Ming." },
  { q: "把下面的句子改成把字句：蛋糕被弟弟吃完了。", opts: ["弟弟把蛋糕吃完了。", "蛋糕把弟弟吃完了。", "弟弟被蛋糕吃完了。", "蛋糕吃完了弟弟把。"], ans: 0, explain: "把字句 pattern: [doer] 把 [object] [action]. 弟弟 is the doer, 蛋糕 is the object." },
  { q: "把下面的句子改成被字句：妈妈把衣服洗干净了。", opts: ["衣服被妈妈洗干净了。", "妈妈被衣服洗干净了。", "衣服把妈妈洗干净了。", "洗干净了被妈妈衣服。"], ans: 0, explain: "The clothes (衣服) were washed clean by Mum (妈妈). 衣服被妈妈洗干净了。" },
  { q: "把下面的句子改成把字句：花瓶被小猫打翻了。", opts: ["小猫把花瓶打翻了。", "花瓶把小猫打翻了。", "小猫被花瓶打翻了。", "打翻了花瓶把小猫。"], ans: 0, explain: "The cat (小猫) knocked over the vase (花瓶). 把字句: 小猫把花瓶打翻了。" },
  { q: "把下面的句子改成被字句：姐姐把房间打扫干净了。", opts: ["房间被姐姐打扫干净了。", "姐姐被房间打扫干净了。", "房间把姐姐打扫干净了。", "打扫干净了房间被姐姐。"], ans: 0, explain: "The room (房间) was cleaned by Sister (姐姐). 房间被姐姐打扫干净了。" },
  { q: "把下面的句子改成把字句：作业被小华做完了。", opts: ["小华把作业做完了。", "作业把小华做完了。", "小华被作业做完了。", "做完了把作业小华。"], ans: 0, explain: "Xiao Hua (小华) finished the homework (作业). 小华把作业做完了。" },
  { q: "把下面的句子改成被字句：爸爸把报纸看完了。", opts: ["报纸被爸爸看完了。", "爸爸被报纸看完了。", "报纸把爸爸看完了。", "看完了报纸被爸爸。"], ans: 0, explain: "The newspaper (报纸) was read by Dad (爸爸). 报纸被爸爸看完了。" },
  { q: "把下面的句子改成把字句：球被弟弟踢到河里去了。", opts: ["弟弟把球踢到河里去了。", "球把弟弟踢到河里去了。", "弟弟被球踢到河里去了。", "河里把球踢弟弟去了。"], ans: 0, explain: "Brother (弟弟) kicked the ball (球) into the river. 弟弟把球踢到河里去了。" },
  { q: "把下面的句子改成被字句：小狗把骨头叼走了。", opts: ["骨头被小狗叼走了。", "小狗被骨头叼走了。", "骨头把小狗叼走了。", "叼走了骨头被小狗。"], ans: 0, explain: "The bone (骨头) was carried away by the puppy (小狗). 骨头被小狗叼走了。" },
  { q: "把下面的句子改成把字句：窗户被大风吹开了。", opts: ["大风把窗户吹开了。", "窗户把大风吹开了。", "大风被窗户吹开了。", "吹开了窗户把大风。"], ans: 0, explain: "The strong wind (大风) blew the window (窗户) open. 大风把窗户吹开了。" },
  { q: "下面哪个被字句是正确的？", opts: ["苹果被妹妹吃掉了。", "妹妹被苹果吃掉了。", "苹果把妹妹吃掉了。", "吃掉了苹果被妹妹。"], ans: 0, explain: "The apple (苹果) was eaten by Sister (妹妹). In 被字句, the object comes first: 苹果被妹妹吃掉了。" },
  { q: "下面哪个把字句是正确的？", opts: ["哥哥把玩具收好了。", "玩具把哥哥收好了。", "哥哥被玩具收好了。", "收好了玩具把哥哥。"], ans: 0, explain: "Brother (哥哥) put the toys (玩具) away. 把字句: 哥哥把玩具收好了。" },
  { q: "把下面的句子改成被字句：老师把黑板擦干净了。", opts: ["黑板被老师擦干净了。", "老师被黑板擦干净了。", "黑板把老师擦干净了。", "擦干净了黑板被老师。"], ans: 0, explain: "The blackboard (黑板) was wiped clean by the teacher (老师). 黑板被老师擦干净了。" },
  { q: "把下面的句子改成把字句：信被邮递员送来了。", opts: ["邮递员把信送来了。", "信把邮递员送来了。", "邮递员被信送来了。", "送来了信把邮递员。"], ans: 0, explain: "The postman (邮递员) delivered the letter (信). 邮递员把信送来了。" },
  { q: "把下面的句子改成被字句：同学们把教室布置好了。", opts: ["教室被同学们布置好了。", "同学们被教室布置好了。", "教室把同学们布置好了。", "布置好了教室被同学们。"], ans: 0, explain: "The classroom (教室) was decorated by the students (同学们). 教室被同学们布置好了。" }
],

ch2: [
  // 反问句 and 陈述句 (~15 questions)
  { q: "把下面的反问句改成陈述句：难道我们不应该爱护花草吗？", opts: ["我们应该爱护花草。", "我们不应该爱护花草。", "花草应该爱护我们。", "难道花草不好吗？"], ans: 0, explain: "The rhetorical question implies YES we should. Remove 难道...不...吗 and state directly: 我们应该爱护花草。" },
  { q: "把下面的陈述句改成反问句：我们不能浪费食物。", opts: ["难道我们能浪费食物吗？", "我们能浪费食物。", "难道我们不能浪费食物吗？", "我们浪费食物好不好？"], ans: 0, explain: "To convert to rhetorical question: add 难道 at the start, flip the negative, add 吗. 难道我们能浪费食物吗？ (implies: of course not!)" },
  { q: "把下面的反问句改成陈述句：这么简单的题目，难道你不会做吗？", opts: ["这么简单的题目，你会做。", "这么简单的题目，你不会做。", "这个题目很难。", "难道题目很简单吗？"], ans: 0, explain: "The rhetorical question implies: of course you CAN do it. Statement: 这么简单的题目，你会做。" },
  { q: "把下面的陈述句改成反问句：我们应该尊敬老师。", opts: ["难道我们不应该尊敬老师吗？", "我们不应该尊敬老师。", "难道我们应该尊敬老师吗？", "老师应该尊敬我们吗？"], ans: 0, explain: "Add 难道...不...吗 to convert. 难道我们不应该尊敬老师吗？ (implies: of course we should!)" },
  { q: "把下面的反问句改成陈述句：难道这不是你的书包吗？", opts: ["这是你的书包。", "这不是你的书包。", "你没有书包。", "书包不是你的。"], ans: 0, explain: "The rhetorical question implies: this IS your bag. Remove 难道...不...吗: 这是你的书包。" },
  { q: "把下面的陈述句改成反问句：这里的风景很美。", opts: ["这里的风景难道不美吗？", "这里的风景不美。", "难道这里的风景美吗？", "这里的风景美不美？"], ans: 0, explain: "Add rhetorical markers: 这里的风景难道不美吗？ (implies: it IS beautiful!)" },
  { q: "把下面的反问句改成陈述句：你怎么能不做功课呢？", opts: ["你不能不做功课。", "你能不做功课。", "你不用做功课。", "功课不用做。"], ans: 0, explain: "怎么能...呢 implies disapproval. Statement form: 你不能不做功课 (You must do your homework)." },
  { q: "把下面的陈述句改成反问句：小明不应该欺负同学。", opts: ["小明怎么能欺负同学呢？", "小明应该欺负同学。", "难道小明不应该欺负同学吗？", "小明欺负同学好吗？"], ans: 0, explain: "怎么能...呢 expresses disapproval: 小明怎么能欺负同学呢？ (How can Xiao Ming bully classmates?)" },
  { q: "把下面的反问句改成陈述句：难道我们不应该帮助别人吗？", opts: ["我们应该帮助别人。", "我们不应该帮助别人。", "别人应该帮助我们。", "难道别人不需要帮助吗？"], ans: 0, explain: "The rhetorical question means: we SHOULD help others. Statement: 我们应该帮助别人。" },
  { q: "把下面的陈述句改成反问句：这朵花很漂亮。", opts: ["这朵花难道不漂亮吗？", "这朵花不漂亮。", "难道这朵花漂亮吗？", "这朵花漂亮不漂亮？"], ans: 0, explain: "Add 难道不...吗: 这朵花难道不漂亮吗？ (implies: it IS pretty!)" },
  { q: "把下面的反问句改成陈述句：这么好吃的蛋糕，谁会不喜欢呢？", opts: ["这么好吃的蛋糕，大家都喜欢。", "这么好吃的蛋糕，没有人喜欢。", "蛋糕不好吃。", "谁做的蛋糕？"], ans: 0, explain: "谁会不喜欢呢 implies everyone likes it. Statement: 大家都喜欢。" },
  { q: "把下面的陈述句改成反问句：迟到是不对的。", opts: ["难道迟到是对的吗？", "迟到是对的。", "难道迟到不对吗？", "迟到好不好？"], ans: 0, explain: "Flip the meaning and add 难道...吗: 难道迟到是对的吗？ (Of course it is wrong!)" },
  { q: "把下面的反问句改成陈述句：他怎么能说谎呢？", opts: ["他不能说谎。", "他能说谎。", "他应该说谎。", "说谎没关系。"], ans: 0, explain: "怎么能...呢 means disapproval. He should NOT lie. Statement: 他不能说谎。" },
  { q: "把下面的陈述句改成反问句：妈妈每天都很辛苦。", opts: ["妈妈每天难道不辛苦吗？", "妈妈每天不辛苦。", "难道妈妈每天辛苦吗？", "妈妈辛苦不辛苦？"], ans: 0, explain: "Add 难道不...吗: 妈妈每天难道不辛苦吗？ (Mum works hard every day, doesn't she?)" },
  { q: "下面哪个是反问句？", opts: ["难道你不知道吗？", "你知道吗？", "你知不知道？", "请你告诉我。"], ans: 0, explain: "难道...吗 is the marker for a rhetorical question. It implies: you DO know. The others are genuine questions or requests." }
],

ch3: [
  // Sentence Expansion (~10 questions)
  { q: "扩写下面的句子，选出最好的：小鸟飞。", opts: ["一只可爱的小鸟在蓝蓝的天空中快乐地飞。", "小鸟飞了。", "鸟飞。", "小鸟在飞。"], ans: 0, explain: "Good expansion adds adjectives and adverbs: 可爱的 (cute), 蓝蓝的天空中 (blue sky), 快乐地 (happily)." },
  { q: "扩写下面的句子，选出最好的：花开了。", opts: ["花园里的花儿在温暖的阳光下慢慢地开了。", "花开了。", "很多花开了。", "花儿开。"], ans: 0, explain: "Adds location (花园里), condition (温暖的阳光下), and manner (慢慢地) to expand the sentence." },
  { q: "扩写下面的句子，选出最好的：弟弟跑。", opts: ["弟弟在宽阔的操场上开心地跑。", "弟弟跑了。", "弟弟快跑。", "弟弟在跑。"], ans: 0, explain: "Adds location (宽阔的操场上) and manner (开心地) to make the sentence more vivid." },
  { q: "扩写下面的句子，选出最好的：妈妈笑了。", opts: ["妈妈看到弟弟的成绩单后高兴地笑了。", "妈妈笑了笑。", "妈妈大笑。", "妈妈笑一笑。"], ans: 0, explain: "Good expansion adds reason (看到成绩单后) and manner (高兴地) to explain why and how." },
  { q: "扩写下面的句子，选出最好的：太阳出来了。", opts: ["金色的太阳从东边的山后面慢慢地出来了。", "太阳出来了。", "太阳升起。", "太阳很大。"], ans: 0, explain: "Adds adjective (金色的), location (东边的山后面), and manner (慢慢地) for a vivid description." },
  { q: "扩写下面的句子，选出最好的：小猫睡觉。", opts: ["毛茸茸的小猫在柔软的沙发上安静地睡觉。", "小猫在睡觉。", "猫睡了。", "小猫睡着了。"], ans: 0, explain: "Adds adjectives (毛茸茸的, 柔软的), location (沙发上), and manner (安静地)." },
  { q: "扩写下面的句子，选出最好的：雨下了。", opts: ["又大又密的雨从灰蒙蒙的天空中不停地下了下来。", "雨下了。", "下大雨。", "下雨了。"], ans: 0, explain: "Adds description of rain (又大又密的), sky (灰蒙蒙的天空中), and manner (不停地)." },
  { q: "扩写下面的句子，选出最好的：同学们做操。", opts: ["同学们在绿油油的草地上整齐地做操。", "同学们在做操。", "大家做操。", "同学们做早操。"], ans: 0, explain: "Adds location (绿油油的草地上) and manner (整齐地) to expand the sentence." },
  { q: "扩写句子时，下面哪种做法是对的？", opts: ["加上形容词、地点和动作的样子，让句子更生动", "把句子变短", "去掉主语", "只加一个字"], ans: 0, explain: "Sentence expansion means adding adjectives, location, manner (adverbs) to make the sentence more vivid and detailed." },
  { q: "扩写下面的句子，选出最好的：风吹。", opts: ["凉爽的秋风轻轻地吹过金黄的稻田。", "风吹了。", "大风吹。", "风在吹。"], ans: 0, explain: "Adds adjective (凉爽的), manner (轻轻地), and object/location (金黄的稻田) for a complete picture." }
],

tricky: [
  // Tricky Sentences (~10 questions)
  { q: "「妈妈把饭做好了」改成被字句，下面哪个是对的？", opts: ["饭被妈妈做好了。", "妈妈被饭做好了。", "饭把妈妈做好了。", "做好了饭被妈妈。"], ans: 0, explain: "被字句: the object (饭) comes first + 被 + doer (妈妈) + action. 饭被妈妈做好了。" },
  { q: "下面哪个句子是反问句？", opts: ["这难道不是你做的吗？", "这是你做的吗？", "这是你做的。", "请问这是谁做的？"], ans: 0, explain: "难道...不...吗 is the rhetorical question pattern. It implies: this IS what you did." },
  { q: "「难道学习不重要吗？」改成陈述句后，意思是：", opts: ["学习很重要。", "学习不重要。", "学习一般重要。", "不用学习。"], ans: 0, explain: "The rhetorical question implies that learning IS important. Remove 难道...不...吗 to get: 学习很重要。" },
  { q: "下面哪个把字句是错误的？", opts: ["书本把小明看完了。", "小明把书本看完了。", "妈妈把菜炒好了。", "弟弟把牛奶喝完了。"], ans: 0, explain: "书本把小明看完了 is wrong because the book (书本) cannot be the doer of reading. It should be: 小明把书本看完了。" },
  { q: "「他不应该迟到」改成反问句，下面哪个最好？", opts: ["他怎么能迟到呢？", "他应该迟到吗？", "他迟到了吗？", "他为什么迟到？"], ans: 0, explain: "怎么能...呢 expresses strong disapproval. 他怎么能迟到呢？ (How can he be late?)" },
  { q: "下面哪个扩写后的句子最好？原句：鱼游。", opts: ["一条美丽的金鱼在清澈的小溪里自由自在地游。", "鱼在游。", "鱼游来游去。", "很多鱼在游。"], ans: 0, explain: "Best expansion adds: adjective (美丽的金鱼), location (清澈的小溪里), manner (自由自在地)." },
  { q: "「窗户被大风吹破了」，在这个句子里，谁是做动作的？", opts: ["大风", "窗户", "没有人", "玻璃"], ans: 0, explain: "In a 被字句, the word after 被 is the doer. 大风 (strong wind) is the one that blew the window." },
  { q: "下面哪个反问句改成陈述句后意思会改变？", opts: ["以上都不会改变意思", "难道天不冷吗？改成：天很冷。", "难道你不饿吗？改成：你很饿。", "难道这不好吗？改成：这很好。"], ans: 0, explain: "Converting a rhetorical question to a statement should NOT change the meaning. All three conversions correctly preserve the original meaning." },
  { q: "「弟弟把玻璃杯打碎了」，如果改成被字句，哪个部分要放在句子最前面？", opts: ["玻璃杯", "弟弟", "打碎了", "把"], ans: 0, explain: "In 被字句, the object goes first: 玻璃杯被弟弟打碎了。So 玻璃杯 goes to the front." },
  { q: "扩写句子的时候，下面哪种词语最常用来形容动作的样子？", opts: ["地（如：开心地、慢慢地）", "的（如：美丽的）", "了（如：做完了）", "吗（如：好吗）"], ans: 0, explain: "地 is used before verbs to describe HOW an action is done (adverb marker). E.g., 快乐地跑 = run happily." }
]

};
