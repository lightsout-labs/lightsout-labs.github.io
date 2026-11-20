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

Things no pattern catches, which the reviewer checks:

- Triplets by reflex ("fast, reliable, and scalable") where one word was
  meant.
- Hedging every claim, or praising the reader for asking.
- A section that repeats the previous one in other words.
- A summary paragraph at the end under a different name.

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
# Formulaic endings
ban: in conclusion
ban: in summary
ban: to sum up
ban: to summarize
ban: at the end of the day
# "Not just X, it's Y"
pattern: \bit's not just\b.{0,60}\bit's\b
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
