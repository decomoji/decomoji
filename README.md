# decomoji v5-preview

v5の制作がなかなか進まないので、`decomoji/preview/` にプレビュー版として作ったデコモジを順次追加していくことにしました。

このブランチはパブリックベータを兼ねています。

v5 には削除スクリプトを搭載する予定であり、プレビュー版にも含まれています。ですが **このブランチでのテストが不十分なので、利用によって生じた損害について一切の責任は負いません。**

それゆえ、あえて npm run-script に追加していません。利用の際はスクリプトファイルをよく読み、実装を完全に理解した上で実行してください。

---

---

**ダークモードでも読めるように改良した v5 のプレビュー版があります**

https://github.com/decomoji/slack-reaction-decomoji/pull/63

導入方法はプルリクを参照ください。プレビュー版につき、スクリプトの動作は保証されません。ご了承ください。

---

![](images/ss_basic.png)

Slackのリアクション機能で使えるカスタム絵文字のアセットです。このプロジェクトではそれら一つ一つを「デコモジ」と呼んでいます。

## Slackで使うとこうなります

![](images/ss_using.png)

これらのデコモジは、[@imaz](https://github.com/imaz)氏が作成した`:naruhodo:`に影響を受け生み出されました。

## 特徴

1. カラフルなテキスト画像
2. 割注レイアウトで読みやすい
3. 高精細ディスプレイ対応
4. リアクションだけでなくステータスや平文にも

デコモジはテキストを書き込んだ画像ファイルです。略語、字詰め、ワクワク感にこだわりました。

ハイコンテキスト！　だから使って楽しい！　デコモジは迅速なコミュニケーションを可能にします。

---

## インストール

[INSTALLATION.md](INSTALLATION.md)

## 基本セットと拡張セット

[docomoji-basic.md](decomoji-basic.md)

基本セットは、すぐに使えてSlackが楽しくなるセットです。

[docomoji-extra.md](decomoji-extra.md)

拡張セットは、作りたいと思った気持ちのままに作ったセットです。

## コントリビューティング

[CONTRIBUTING.md](CONTRIBUTING.md)

## ファイル名ルール

[NOTATIONS.md](NOTATIONS.md)

訓令式ローマ字をベースに、小書きや記号についてのルールをカスタムしています。

## ライセンス

Copyright (c) 2015 decomoji consortium and other contributors.

Under the [MIT License](LICENSE.txt).

## チェンジログ

[CHANGES.md](CHANGES.md)

## Who use decomoji?

[who-use-decomoji](https://github.com/decomoji/who-use-decomoji)

あなたの所属する組織のSlackチームでデコモジが使われていたら、ぜひ「Who use decomoji?」リポジトリに追加してください。Issueで教えてもらってもいいですし、編集してプルリクエストを投げてもらってもよいです！

## サポーターになる

サポーターになっても一般のユーザーと比べてなんのアドバンテージもありません。

それでも、この活動を応援していただけるなら、Patreon から寄付をお願いいたします。

<a href="https://www.patreon.com/bePatron?u=486549" data-patreon-widget-type="become-patron-button">Become a Patron!</a><script async src="https://c6.patreon.com/becomePatronButton.bundle.js"></script>

あなたの支援に感謝します。

## スペシャルサンクス！

[@imaz](https://github.com/imaz/), [@geckotang](https://github.com/geckotang/), [@ginpei](https://github.com/ginpei/), [@watilde](https://github.com/watilde/), [@matori](https://github.com/matori/), [@fukayatsu](https://github.com/fukayatsu/), [@maiha2](https://github.com/maiha2/), [@webcre8](https://github.com/webcre8/), [@masuP9](https://github.com/masuP9/), [@yuheiy](https://github.com/yuheiy), [@kubosho](https://github.com/kubosho) and All Contributors!

