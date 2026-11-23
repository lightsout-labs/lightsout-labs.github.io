# Style guide

How Lightsout Labs writes, in English and in Chinese. It applies to every
article and every social post. The rule blocks below are read by the content
linter in `make check` (see [ADR 0003](adr/0003-style-rules-in-the-guide.md)),
so changing a block changes the check. Everything else here is for writers and
reviewers.

## The voice

We write as practitioners talking to peers: engineers, tech leads, and product
people who have shipped software and are now deciding how to work with coding
agents.

- **Plain and specific.** Name the file, the slice, the number, the command.
  "The architecture document grew to 65 KB after 30 slices" beats "documents
  can become unwieldy over time".
- **Opinionated.** Take a position and defend it. Say where it breaks. A piece
  that only lists pros and cons has not done its job.
- **First-person plural is fine.** "We" is the people who built `nightshift`
  and `gridworks`. Use it for what we did and saw, not to rope the reader in.
- **Evidence over adjectives.** A claim about `nightshift` or `gridworks`
  points at something in their repositories. A figure from anywhere else
  links to its source. Nothing is invented: no statistics, quotes, studies,
  or customer stories.
- **Short paragraphs, real headings.** A heading says what the section
  claims, not what it is about.
- **End when the argument ends.** The last paragraph adds something: the open
  problem, the next question, what to try on Monday. It never restates the
  piece.

## What makes text read as machine-written

These are the habits the rule blocks catch, and some they cannot.

- Inflated verbs and nouns: delve, leverage, unlock, unleash, harness,
  elevate, embark, tapestry, landscape, realm, testament, game-changer.
- Throat-clearing: "it's important to note", "it's worth noting", "in today's
  fast-paced world", "when it comes to".
- Formulaic endings that summarize what was just said: "in conclusion", "in
  summary", "to sum up", "at the end of the day".
- The "not just X, it's Y" construction, and sentences built on "not only …
  but also" for emphasis.
- Decoration: em-dashes in every paragraph, bold on every other phrase,
  bullet lists where a paragraph would argue better. The blocks set limits per
  1,000 words or characters.

- Chatbot leftovers and stage directions: "great question", "I hope this
  helps", "let's dive in", "here's the thing", "let's be honest".
- Stacked hedges ("could potentially") and intensifiers that only add
  volume ("genuinely", "quite frankly").
- Significance claimed instead of shown: "a pivotal moment", "a major step
  towards", "the future looks bright", "a load-bearing assumption".
- The project's owner in the third person ("the owner", "the person in
  charge"). We built these projects; say "we".
- Slogans built from a list of counts ("one person, one week, forty
  slices"). Give the numbers where they make a point, in a sentence.
- Origin-story openers ("it all started with"). Open with the claim, not
  with how the idea came about.

Things no pattern catches, which the reviewer checks:

- Triplets by reflex ("fast, reliable, and scalable") where one word was
  meant, and the colon that exists only to introduce one.
- Hedging every claim, or praising the reader for asking.
- The "not X, it's Y" move in disguise: split across two sentences ("The
  speed isn't the story. The trust is."), or as a countdown ("Not the price.
  Not the features. The trust."). State the positive claim.
- Contrasts against an invented foil: "false precision rather than genuine
  accuracy", "the call most teams won't make". If nobody holds the opposite
  view, there is no contrast to draw.
- Manufactured punchlines: ordinary sentences chopped into fragments for
  drama, or a paragraph that ends on a one-line reversal it has not earned.
- Frames that announce instead of say: "the part that matters", "here's what
  stood out", "this matters because" followed by no consequence. Delete the
  frame; if nothing is lost, it was never content.
- One thing, several names. If a slice is a slice, do not call it a unit,
  then a chunk, then an increment for variety.
- "Real" and "actual" as decoration ("real results") with no fake version in
  sight.
- Runs of sentences that open the same way, and paragraphs of the same length
  whose order could be shuffled without the reader noticing. Paragraphs that
  can be reordered are missing the reasoning that links them.
- A section that repeats the previous one in other words.
- A summary paragraph at the end under a different name.

### When revising

Removing a tell must not add a new one. When editing a draft to pass the
linter or the reviewer, never add:

- a fact, number, name, or command that is not in the repositories or a
  cited source, to make a sentence "more specific";
- a first-person experience or opinion we did not have;
- staccato fragments to vary rhythm, or em-dashes for drama;
- a straw man to argue against;
- more certainty than the draft had: "may" becoming "does", a plan becoming
  done, a correlation becoming a cause, an attributed view becoming our
  fact.

If a sentence is vague because the evidence is missing, the fix is to find
the evidence or cut the sentence. A list of tells is a prompt to read
closely, not proof that a machine wrote something: careful humans write
"robust" too. These checks adapt the catalogs in
[avoid-ai-writing](https://github.com/conorbronsdon/avoid-ai-writing) and
[humanizer-zh](https://github.com/op7418/humanizer-zh) (both MIT).

### English rules

```style-rules-en
# Words and phrases, matched as whole words, ignoring case.
pattern: \bdelv(?:e|es|ed|ing)\b
pattern: \bin today's\b.{0,40}\bworld\b
ban: fast-paced
ban: it's important to note
ban: it is important to note
ban: it's worth noting
ban: it is worth noting
pattern: \bgame[- ]?changer
ban: tapestry
ban: testament to
ban: navigate the complexities
pattern: \bunlock(?:s|ed|ing)? the (?:full )?potential\b
pattern: \bunleash(?:es|ed|ing)?\b
pattern: \bharness(?:es|ed|ing)? the power\b
pattern: \bleverag(?:e|es|ed|ing)\b
pattern: \bseamless(?:ly)?\b
pattern: \brevolutioni[sz](?:e|es|ed|ing)\b
ban: paradigm shift
ban: cutting-edge
ban: in the realm of
pattern: \bembark(?:s|ed|ing)? on\b
pattern: \belevat(?:e|es|ed|ing) your\b
ban: when it comes to
ban: moreover
ban: furthermore
pattern: \bparadigms?\b
pattern: \blandscapes?\b
pattern: \bpivotal\b
pattern: \bunderscor(?:e|es|ed|ing) (?:the|how|why|that|our|its)\b
pattern: \bmeticulous(?:ly)?\b
pattern: \bshowcas(?:e|es|ed|ing)\b
pattern: \bholistic(?:ally)?\b
pattern: \bsynerg(?:y|ies|istic)\b
pattern: \bthought leader(?:s|ship)?\b
pattern: \butiliz(?:e|es|ed|ing|ation)\b
ban: ever-evolving
ban: actionable
ban: impactful
ban: learnings
ban: interplay
ban: watershed moment
ban: deep dive
ban: at its core
ban: in an era of
ban: in an era where
ban: now more than ever
ban: in a world where
ban: that being said
ban: genuinely
ban: quite frankly
ban: real talk
ban: let's be honest
ban: let's be clear
ban: here's the thing
pattern: \bhere's what (?:stood out|caught my eye|is interesting|matters)\b
pattern: \blet's (?:dive|delve|explore|unpack|take a (?:closer )?look|break (?:it|this) down)\b
pattern: \bwhether you're\b.{0,60}\bor\b
pattern: \bload-bearing (?:assumption|claim|invariant|premise|constraint|dependency|argument|abstraction)s?\b
pattern: \ba (?:major|crucial|significant|important|pivotal|huge|giant|bold) step (?:towards?|forward)\b
pattern: \b(?:could|may|might) potentially\b
pattern: \bworth (?:a look|exploring|checking out|your time)\b
pattern: \b(?:I|we) (?:keep coming back to|can't stop thinking about)\b
# The project's owner in the third person; we write as "we"
ban: the owner
ban: the person in charge
# Slogans built from a list of counts: "one person, one week, forty slices"
pattern: \b(?:(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|forty|fifty) [\w-]+, ){2}(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|forty|fifty) [\w-]+[.!]
# Origin-story openers
pattern: \bit all (?:started|began|starts|begins) (?:with|when|in|as)\b
# Significance and forecasts in place of a claim
ban: the future looks bright
ban: only time will tell
# Chatbot leftovers
ban: great question
ban: I hope this helps
ban: happy to help
pattern: \bas of my (?:last|latest) (?:update|training)\b
# Formulaic endings
ban: in conclusion
ban: in summary
ban: to sum up
ban: to summarize
ban: at the end of the day
# "Not just X, it's Y", joined or split across two sentences
pattern: \bit's not just\b.{0,60}\bit's\b
pattern: \b(?:isn't|is not|aren't|are not) (?:just|merely|simply) [^.!?]{0,60}[,;:—.] +(?:it|this|that|they)(?:'s|'re| is| are)\b
# Per 1,000 words
limit: em-dash 3
limit: bold 2
limit: bullet-lists 2
```

### Chinese rules

中文部分的要求与英文相同：说人话，说具体的事，有观点，不堆砌。另外注意：

- 不用“赋能”“抓手”“闭环”“底层逻辑”“颗粒度”这类会议室词汇。
- 不用“在当今……的时代”“随着……的飞速发展”开头。
- 不用“不仅……更是”“首先……其次……最后”撑起结构。
- 不用“让我们一起”“综上所述”“总而言之”收尾。
- 不拔高意义：“具有里程碑意义”“扮演着至关重要的角色”“开启了新篇章”，
  说清楚具体改变了什么。
- 不堆四字套话：“日新月异”“举足轻重”“不容忽视”“方兴未艾”。
- 不替读者划重点：“值得一提的是”“不难发现”“有趣的是”，直接说事实。
- 不叠加含糊词：“或许可能”“在一定程度上可能”，把握多大就说多大。
- 不留聊天腔：“好问题”“希望对你有帮助”“让我们来看看”。
- “与其说……不如说”“这不是……而是……”只在真有人持相反看法时用。
  拆成两句的版本（“问题不在速度。问题在信任。”）也算。
- 不用第三人称称呼项目的主人（“负责人”），我们做的事就说“我们”。
- 不用数量排成口号（“一个人、一周、四十个切片”），数字放进句子里说明问题。
- 不用起源故事开头（“一切从……开始”），开头直接给出论点。
- 不在句尾补一句拔高：“彰显了团队对创新的追求”“标志着新时代的到来”。
  事实说完就停。

规则块抓不到、由审阅者检查的：

- 与假想敌辩论：“不要误会，我并不是在制造焦虑”。没人这么说，就不必反驳。
- 碎片式收尾：“文件没了。消失了。再也找不到了。”同一个意思只说一次。
- 首句复读标题，或正文谈论上一稿（“这一段是刚补充的说明”）。
- 层叠的“的”：“一个十亿参数的开源小模型的微调的完整方案”，拆开说。
- “对……进行测试”“进行调整”能换成直接动词时就换；“进行到哪一步”
  这类正常用法不改。
- 被字句一句接一句；施事者已知时改主动句。
- 四字词排比（“稳定可靠、快速响应、易于维护”）没有具体内容支撑时，
  改成平实的说法。
- 生造的复合标签（“文稿-校对-发布一体化机制”），直接说它做了什么。
- 重复的免责声明：“现有资料没有记载”说一次就够。
- 破折号、加粗、列表都有密度上限，按每千字计算。

```style-rules-zh
# 词语与短语，原样匹配
ban: 赋能
ban: 抓手
ban: 闭环
ban: 底层逻辑
ban: 颗粒度
ban: 助力
ban: 值得注意的是
ban: 不可或缺
ban: 至关重要
ban: 深入探讨
ban: 毋庸置疑
ban: 众所周知
ban: 让我们一起
pattern: 不仅.{0,30}更是
pattern: 在当今.{0,20}时代
pattern: 随着.{0,20}的(?:飞速|快速|迅猛|蓬勃)发展
pattern: 首先.{0,80}其次.{0,80}最后
# 用第三人称说项目的主人；我们用“我们”
ban: 负责人
# 用数量排成的口号：“一个人、一周、四十个切片”
pattern: (?:[一二两三四五六七八九十百千]+[^、，。\s\d]{1,4}、){2}[一二两三四五六七八九十百千]+[^、，。\s\d]
# 起源故事式开头
pattern: 一切都?(?:从.{0,20}(?:开始|说起)|始于|源于)
# 意义拔高与套话
ban: 里程碑意义
ban: 划时代
ban: 新篇章
ban: 举足轻重
ban: 不容忽视
ban: 日新月异
ban: 方兴未艾
ban: 重中之重
ban: 不言而喻
ban: 全方位
pattern: 扮演着?.{0,12}(?:重要|关键|核心|至关重要)的?角色
pattern: 发挥着?.{0,8}(?:重要|关键|核心)(?:的)?作用
pattern: 在.{0,12}(?:浪潮|大潮)(?:中|下)
ban: 彰显
ban: 堪称
ban: 充分体现
pattern: 标志着.{0,16}(?:时代|纪元|到来|开端)
pattern: 在.{0,16}的时代背景下
# 起跑式铺垫与套话收尾
ban: 以下是你需要知道的
ban: 拭目以待
ban: 期待更多可能
# 替读者划重点
ban: 值得一提的是
ban: 需要指出的是
ban: 不难发现
ban: 不难看出
ban: 有趣的是
# 含糊词叠加
pattern: (?:或许|也许)可能
# 聊天腔
ban: 好问题
ban: 希望对你有所帮助
ban: 希望对你有帮助
pattern: 让我们(?:来)?(?:看看|深入|一起来)
# 套路化结尾
ban: 综上所述
ban: 总而言之
ban: 总的来说
ban: 一句话总结
# 每千字上限
limit: em-dash 1.5
limit: bold 1
limit: bullet-lists 1
```
