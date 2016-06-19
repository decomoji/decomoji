# Slack Reaction Decomoji v2

Custom emoji icon collection for slack reaction. These icon called "Decomoji" in this project.

![screen shot](./ss.png)

[日本語ドキュメント](./README_ja.md)

<script async class="speakerdeck-embed" data-id="4567c6a6f46a4461b4af0f608791a679" data-ratio="1.33333333333333" src="//speakerdeck.com/assets/embed.js"></script>

## Introduction

[promotion slide pdf](promotion.pdf) (japanese)

## Feature

1. text image
2. 4 letters(almost)
3. easy reading with warichu(inline cutting note style)
4. colorful
5. compatible with JUMBOMOJI
6. compatible with Retina display

Decomoji made up of the text image. You can do fast communication with high-context!

## Breaking changes in v2

### 1. JUMBOMOJI ready

Decomoji are size-up to 64*64px.

If you using v1(no-mark version) and update to v2, need to remove old decomojies at setting page.

### 2. Unification of filename

Fix spelling inconsistency. Decomoji v2 use [roman alphabet input method(JIS X4063:2000)](https://ja.wikipedia.org/wiki/%E3%83%AD%E3%83%BC%E3%83%9E%E5%AD%97%E5%85%A5%E5%8A%9B#.E5.BF.85.E3.81.9A.E5.AE.9F.E8.A3.85.E3.81.97.E3.81.AA.E3.81.91.E3.82.8C.E3.81.B0.E3.81.84.E3.81.91.E3.81.AA.E3.81.84.E5.85.A5.E5.8A.9B.E6.96.B9.E5.BC.8F).

## All Decomoji List

[Look here.](decomoji-list.md)

## Installation

**Need permission.**

### by manual

Add decomoji in a browser. Access to [https://{{your-team-name}}.slack.com/customize/emoji](https://{{your-team-name}}.slack.com/customize/emoji).

### by script

Need ruby, bundler.

```bash
$ git clone git@github.com:oti/slack-reaction-decomoji.git
$ cd slack-reaction-decomoji
$ bundle install
$ bundle exec ruby import.rb
```

In CLI, input your slack team name, ID(email address) and PASS.

![screen shot of script importing](./ss_import.png)

## LICENSE

[![Creative Commons License](https://i.creativecommons.org/l/by-nc/3.0/88x31.png "CC BY-NC 3.0")](https://creativecommons.org/licenses/by-nc/3.0/deed.en)  
This product is licensed under [CC BY-NC 3.0](http://creativecommons.org/licenses/by-nc/3.0/deed.en) ([Japanese](https://creativecommons.org/licenses/by-nc/3.0/deed.ja))

## Special Thanks

[@geckotang](https://github.com/geckotang/)  
[@ginpei](https://github.com/ginpei/)  
[@watilde](https://github.com/watilde/)  
[@matori](https://github.com/matori/)  
[@fukayatsu](https://github.com/fukayatsu/)