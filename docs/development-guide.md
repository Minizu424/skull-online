# Skull Online - 開発ガイド

## 目的
このドキュメントは、チーム開発を円滑に進めるための共通ルールをまとめたものです。  
対象は以下です。りょうすkr

- コードの書き方
- ブランチの作り方
- 命名規則
- コミットと Pull Request のルール
- フォルダ運用
- 開発の進め方
- バグ修正や相談時のルール

このプロジェクトでは、**「短期間で動くものを作ること」** と **「初心者でも破綻しにくいこと」** を重視します。

---

# 1. 開発の基本方針

## 1.1 まず動くものを優先する
このプロジェクトでは、完璧な設計よりも、まず遊べる最小版を作ることを優先します。

優先順位は以下です。

1. まず動く
2. 次に分かりやすくする
3. その後で必要なら整理する

最初から作り込みすぎると、実装が止まりやすくなります。  
特に1か月単位で進める開発では、**MVP（最小完成版）を最初に作る**ことが大切です。

---

## 1.2 難しい仕組みは後回し
以下は最初から入れない方針とします。

- 過剰な抽象化
- 複雑な状態管理ライブラリ
- 不要な共通化
- Docker
- DB
- 認証
- 観戦機能
- ランキング
- 戦績保存
- 不必要なアニメーションの作り込み

---

## 1.3 迷ったら「誰が見ても分かる方」を選ぶ
実装方法に迷った場合は、以下の順で優先します。

1. 読みやすい
2. 変更しやすい
3. バグりにくい
4. 速い
5. かっこいい

このプロジェクトでは、**チームメンバー全員が追えること**が重要です。

---

# 2. 技術構成

## 2.1 フロントエンド
- Vite
- React
- TypeScript

## 2.2 バックエンド
- Node.js
- Socket.IO
- Express（補助用途）

## 2.3 ドキュメント
- Markdown (`docs/`)

---

# 3. ディレクトリ運用ルール

## 3.1 全体構成
```text
SKULL-ONLINE/
  client/
  server/
  docs/
  .gitignore
  README.md
```

## 3.2 client
ユーザーが見る画面を扱います。

例:
- 名前入力画面
- ルーム参加画面
- 待機室
- ゲーム画面
- 音声設定UI
- 勝敗表示

## 3.3 server
ゲームの裏側を扱います。

例:
- ルーム管理
- プレイヤー管理
- 手番管理
- カード状態管理
- 入札処理
- 勝敗判定
- Socket.IO イベント処理

## 3.4 docs
仕様やルールを置きます。

例:
- `rules.md`
- `structure.md`
- `tasks.md`
- `development-guide.md`

---

# 4. ブランチ運用ルール

## 4.1 基本ルール
- `main` は安定版のみを置く
- 作業は `feature/...` ブランチで行う
- `main` に直接 push しない
- 変更は Pull Request 経由で統合する

---

## 4.2 ブランチの種類

### `main`
安定版ブランチ。  
「今の時点で他の人が pull しても大丈夫な状態」を保つ。

### `feature/...`
新機能開発用ブランチ。

例:
- `feature/name-room`
- `feature/game-ui`
- `feature/socket-base`
- `feature/game-logic`
- `feature/audio-settings`

### `fix/...`
バグ修正用ブランチ。

例:
- `fix/join-room-bug`
- `fix/socket-reconnect`

### `docs/...`
ドキュメント修正用ブランチ。

例:
- `docs/update-rules`
- `docs/add-setup-guide`

### `refactor/...`
整理・書き換え用ブランチ。

例:
- `refactor/split-components`
- `refactor/server-events`

---

## 4.3 ブランチ作成ルール
- **1ブランチ = 1目的** にする
- 人ごとではなく、機能ごとに切る
- 長く生かしすぎない
- 作業が終わったら早めに PR を出す

悪い例:
- `ryo-branch`
- `test`
- `feature/all`

良い例:
- `feature/name-input`
- `feature/room-join`
- `fix/audio-volume`

---

## 4.4 ブランチ作成の流れ
```bash
git checkout main
git pull
git checkout -b feature/name-room
```

---

## Git ブランチ操作コマンド

### 現在のブランチを確認する
```bash
git branch
```

### 新しいブランチを作って、そのまま移動する
```bash
git checkout -b feature/name-room
```

### 既存のブランチへ移動する
```bash
git checkout main
```

### ブランチ一覧を見る
```bash
git branch
```

### リモートを含めてブランチ一覧を見る
```bash
git branch -a
```

### 作業前に main を最新にする
```bash
git checkout main
git pull
```

### main を最新にしてから新しいブランチを切る
```bash
git checkout main
git pull
git checkout -b feature/game-ui
```

### ブランチを push する
```bash
git push -u origin feature/name-room
```

### 作業後に main へ戻る
```bash
git checkout main
```

---

## ブランチ操作の基本ルール
- 新しい作業を始める前に `main` を最新にする
- 作業は `feature/...` ブランチで行う
- 作業後は push して Pull Request を作る
- `main` に直接 push しない


# 5. コミットルール

## 5.1 基本方針
- 小さく commit する
- 何をしたかが分かるメッセージにする
- 大きすぎる変更を1回で入れない

---

## 5.2 良いコミットメッセージ
- `Add name input UI`
- `Implement join room event`
- `Create waiting room layout`
- `Fix player list rendering`
- `Update project documentation`

---

## 5.3 避けたいコミットメッセージ
- `fix`
- `update`
- `change`
- `いろいろ修正`
- `done`

---

## 5.4 コミットの粒度
1回の commit には、なるべく1つの意味だけを持たせる。

例:
- UI作成
- バグ修正
- 型修正
- ドキュメント更新

を混ぜすぎない。

---

# 6. Pull Request ルール

## 6.1 基本ルール
- `main` に直接 push しない
- 変更は Pull Request で統合する
- PR のタイトルで内容が分かるようにする

---

## 6.2 PRタイトルの例
- `Add name and room input UI`
- `Implement basic socket connection`
- `Fix join room event handling`
- `Add development documents`

---

## 6.3 PR本文に書くこと
最低限、以下を書く。

- 何をしたか
- 何をしていないか
- 動作確認方法
- 不安な点、未解決点

例:

```md
## 概要
名前入力とルームID入力のUIを追加しました。

## 変更内容
- 名前入力欄を追加
- ルームID入力欄を追加
- Joinボタンを追加

## 未対応
- Socket.IO 接続処理は未実装

## 確認方法
client を起動して入力欄が表示されることを確認
```

---

# 7. 命名規則

## 7.1 基本方針
命名は、**短すぎず、意味が分かるもの**にする。  
省略しすぎない。

悪い例:
- `a`
- `tmp`
- `data2`
- `obj`

良い例:
- `playerName`
- `roomId`
- `currentBid`
- `isConnected`

---

## 7.2 変数名
JavaScript / TypeScript の変数名は **camelCase** を使う。

例:
- `playerName`
- `roomId`
- `gameState`
- `currentPlayerIndex`

---

## 7.3 関数名
動詞から始める。

例:
- `handleJoinRoom`
- `createPlayer`
- `updateGameState`
- `sendBid`
- `playSkullSound`

「何をする関数か」が分かる名前にする。

---

## 7.4 定数名
固定値で意味の強いものは **UPPER_SNAKE_CASE** でもよい。

例:
- `MAX_PLAYERS`
- `DEFAULT_VOLUME`

ただし、普通の定数は camelCase でもよい。

例:
- `defaultPlayerName`
- `initialGameState`

---

## 7.5 React コンポーネント名
**PascalCase** を使う。

例:
- `NameForm`
- `RoomPanel`
- `WaitingRoom`
- `GameBoard`
- `AudioSettingsModal`

---

## 7.6 ファイル名
React コンポーネントのファイル名は **PascalCase** 推奨。

例:
- `NameForm.tsx`
- `WaitingRoom.tsx`
- `GameBoard.tsx`

ユーティリティや設定ファイルは用途に応じてよい。

例:
- `socket.ts`
- `constants.ts`
- `gameLogic.ts`

---

## 7.7 イベント名
Socket.IO のイベント名は、意味が分かる **snake_case** か **lowercase** を使う。  
このプロジェクトでは **snake_case** に統一する。

例:
- `join_room`
- `player_joined`
- `start_game`
- `place_card`
- `start_bid`
- `reveal_card`
- `round_result`

---

# 8. コードの書き方

## 8.1 1つのファイルに詰め込みすぎない
最初は `App.tsx` にまとめてもよいが、画面が大きくなったら分ける。

分ける目安:
- 1画面に責務が多い
- JSX が長く読みにくい
- 同じ表示を何度も使う
- テストや修正がしにくい

---

## 8.2 関数は短く保つ
1つの関数に多くの責務を持たせすぎない。

悪い例:
- 入室処理
- バリデーション
- UI更新
- サウンド再生
- エラー表示

を1つの関数で全部やる

良い例:
- `validateRoomInput`
- `handleJoinRoom`
- `showJoinError`

に分ける

---

## 8.3 コメントの方針
コメントは「見れば分かること」を書かない。  
**なぜそうしているか** が必要なときに書く。

悪い例:
```ts
const roomId = inputValue; // roomIdを代入
```

良い例:
```ts
// MVPではルームID未入力時は送信しない
if (!roomId) return;
```

---

## 8.4 if文は浅くする
ネストが深くなりすぎると読みにくい。  
早めに return できるなら return する。

悪い例:
```ts
if (roomId) {
  if (playerName) {
    joinRoom();
  }
}
```

良い例:
```ts
if (!roomId) return;
if (!playerName) return;

joinRoom();
```

---

## 8.5 型をサボりすぎない
TypeScript を使う以上、最低限の型はつける。

例:
- player
- room
- card
- gameState
- socket event payload

`any` は必要なときだけ使う。  
雑に `any` を増やしすぎない。

---

## 8.6 マジックナンバーを避ける
意味のある数字や文字列は定数化する。

悪い例:
```ts
if (players.length >= 4) return;
```

良い例:
```ts
const MAX_PLAYERS = 4;

if (players.length >= MAX_PLAYERS) return;
```

---

## 8.7 UI文言を雑にしない
ボタンや表示文言は、後で見ても分かるものにする。

悪い例:
- `OK`
- `GO`
- `Next`

良い例:
- `ルームに参加`
- `入札する`
- `再戦する`

---

# 9. フロントエンド実装ルール

## 9.1 画面とロジックを少しずつ分ける
最初は `App.tsx` に書いてもよい。  
ただし、規模が大きくなったら以下の分離を検討する。

- 画面コンポーネント
- 共通コンポーネント
- 型定義
- 通信処理
- ユーティリティ関数

---

## 9.2 `public/` の使い方
静的ファイルは `public/` に置く。

例:
- 効果音
- ロゴ
- 固定画像

例:
```text
client/public/
  sounds/
    skull.mp3
    click.mp3
  images/
    logo.png
```

---

## 9.3 `src/` の使い方
React のコード本体は `src/` に置く。

今後の理想例:
```text
client/src/
  components/
  pages/
  types/
  utils/
  socket.ts
  App.tsx
  main.tsx
```

ただし、最初から分けすぎなくてよい。

---

# 10. バックエンド実装ルール

## 10.1 サーバーは「正しい状態の管理役」
サーバーでは以下を管理する。

- どのルームに誰がいるか
- 今誰の手番か
- どのカードが置かれているか
- 入札状況
- 勝敗判定

クライアントは表示担当、サーバーは状態管理担当、という意識を持つ。

---

## 10.2 Socket.IOイベントは明確にする
イベント名は曖昧にしない。

悪い例:
- `send`
- `update`
- `change`

良い例:
- `join_room`
- `place_card`
- `submit_bid`
- `reveal_card`
- `game_finished`

---

## 10.3 サーバー側で最低限の検証をする
クライアントから送られたデータをそのまま信用しない。

例:
- roomId が空でないか
- playerName が空でないか
- その手番で本当に行える操作か
- 不正なカード枚数でないか

---

# 11. ドキュメント更新ルール

## 11.1 仕様変更時
ルール変更や仕様変更があったら、`docs/rules.md` を更新する。

## 11.2 構成変更時
フォルダ構成や主要ファイルが変わったら、`docs/structure.md` を更新する。

## 11.3 タスク変更時
やることが増えた・減ったら、`docs/tasks.md` を更新する。

---

# 12. Issue・相談・エラー対応ルール

## 12.1 相談時に書くべきこと
相談するときは以下をセットで伝える。

- 何をしたいか
- 今どうなっているか
- どのファイルを触ったか
- エラーメッセージ
- 自分の予想

---

## 12.2 ChatGPTに聞くとき
以下をまとめて渡すと精度が上がる。

- 目的
- 現在のコード
- エラー内容
- 期待する動作
- 試したこと

---

## 12.3 バグ修正時
バグを見つけたら以下を意識する。

1. まず再現条件を確認する
2. どの変更で壊れたか考える
3. できるだけ小さい修正にする
4. 直したら動作確認する
5. 必要なら docs を更新する

---

# 13. 作業の進め方

## 13.1 基本の流れ
1. `main` を最新にする
2. ブランチを切る
3. 小さく作業する
4. 動作確認する
5. commit する
6. push する
7. Pull Request を出す

---

## 13.2 1機能ごとの作業例
例: 名前入力画面を追加する場合

1. `feature/name-input` を作る
2. `App.tsx` か新規コンポーネントを編集する
3. 入力欄を追加する
4. 動作確認する
5. commit する
6. push する
7. PR を作る

---

# 14. MVPで優先する機能

## 最優先
- 名前入力
- ルーム参加
- 待機室
- カードを伏せて出す
- 入札
- 公開
- 勝敗表示

## 後回し
- 観戦
- チャット
- 戦績保存
- ログイン
- 複雑な音声設定保存
- アニメーション強化

---

# 15. このプロジェクトで避けること

- `main` に直接 push
- 1ブランチで何でもやる
- 雑な変数名
- 大きすぎる commit
- 仕様が曖昧なまま実装を進める
- `any` の多用
- `node_modules` を push する
- docs を放置する

---

# 16. 最後に
この開発では、**技術的に最強な設計**より、**チーム全員が追えて、継続できる設計**を優先します。  
迷ったときは、以下に戻ること。

- 誰が見ても分かるか
- 今必要な機能か
- 1か月で完成に近づくか
- 他の人が修正しやすいか
