# decomoji v5

![](docs/images/ss_basic.png)

Slack のリアクション機能で使えるカスタム絵文字のアセットです。このプロジェクトではそれら一つ一つを「デコモジ」と呼んでいます。

## Slack で使うとこうなります

![](docs/images/ss_using.png)

これらのデコモジは、[@imaz](https://github.com/imaz)氏が作成した`:naruhodo:`に影響を受け生み出されました。

## デコモジだけの５つの特徴

1. **カラフルなテキスト画像** - 見やすい 12 のカラーパレットで Slack に彩を添えます！
2. **ダークモード対応** - 調整を重ねたカラーパレットにより背景を暗くしてもデコモジなら読めます！
3. **職人による割中レイアウト** - 2 行取りをベースに、長い言葉は 3 行取りにレイアウトしました！
4. **圧倒的な物量** - v5 時点で圧巻の 5000 個超え！　デコモジなら使いたいリアクションが必ず見つかります！
5. **登録と削除の自動スクリプト** - 膨大なデコモジもコマンドラインから自動でインストール！

デコモジはテキストを書き込んだ画像ファイルです。略語、字詰め、ワクワク感にこだわりました。

ハイコンテキスト！　だから使って楽しい！　デコモジはあなたのワークスペースに**カルチャーとベロシティを提供**します！

## まずは基本セットから始めましょう

デコモジには 3 つのカテゴリがあります。リンク先のドキュメントにアクセスすると**超大量に画像ファイルを通信する**のでご注意ください。

- [基本セット](docs/LIST-basic.md): すぐに使えて Slack が楽しくなるセットです。
- [拡張セット](docs/LIST-extra.md): 基本セットと合わせるとさらに Slack が便利で楽しくなるセットです。
- [露骨セット](docs/LIST-explicit.md): 性的なもの、暴力的なもの、露骨な表現になっていて使用には注意が必要なものを隔離したセットです。多くの場合、使わない方が良いです。

## ワークスペースへの登録方法

**カスタム絵文字の追加には権限が必要です。**

デコモジをあなたのワークスペースに登録する方法は 3 つあります。

1. 絵文字登録ページのフォームから一つずつ登録する
2. Chrome 用のエクステンション [Neutral Face Emoji Tools](https://chrome.google.com/webstore/detail/neutral-face-emoji-tools/anchoacphlfbdomdlomnbbfhcmcdmjej) を使って Drag&Drop で登録する
3. スクリプトでコマンドラインから一括登録・削除する

次のセクションで 3 つ目の方法について解説しています。

### スクリプトでコマンドラインから一括登録・削除する

この操作はエンジニア向けです。実行には Node.js v12.16.3 が必要です。

プロジェクトルートで依存パッケージをインストールしてから Node コマンドを実行してください。

```bash
npm ci
node scripts/manager
```

![](docs/images/ss_demo.gif)

対話式でワークスペース、アカウント、パスワード、追加か削除、対象のデコモジカテゴリーを入力すると、自動で処理が始まります。全てのデコモジを追加・削除するのに 60 分ほどかかります。

## フー・ユーズ・デコモジ？

あなたの所属する組織のチームやコミュニティでデコモジが使われていたら、ぜひ「Who use decomoji?」リポジトリに追加して教えてください！

[who-use-decomoji](https://github.com/decomoji/who-use-decomoji)

## サポートするには

Patreon で支援を受け付けています。

<a href="https://www.patreon.com/bePatron?u=486549"><img src="docs/images/banner_patreon.png" width="217" height="51"></a>

## その他のドキュメント

- [高度な管理方法について](docs/ADVANCED.md)
- [コントリビューティングガイドラインについて](docs/CONTRIBUTING.md)
- [デコモジファイルの命名規則について](docs/NOTATIONS.md)
- [チェンジログ](docs/CHANGES.md)

## スペシャルサンクス！

[@imaz](https://github.com/imaz/), [@geckotang](https://github.com/geckotang/), [@ginpei](https://github.com/ginpei/), [@watilde](https://github.com/watilde/), [@matori](https://github.com/matori/), [@fukayatsu](https://github.com/fukayatsu/), [@maiha2](https://github.com/maiha2/), [@webcre8](https://github.com/webcre8/), [@masuP9](https://github.com/masuP9/), [@yuheiy](https://github.com/yuheiy), [@kubosho](https://github.com/kubosho) and All Contributors!

## ライセンス

Copyright (c) 2015 decomoji consortium and other contributors.

Under the [MIT License](LICENSE.txt).
