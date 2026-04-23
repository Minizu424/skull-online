# Skull Online

オンライン版ボードゲーム「Skull」を制作するプロジェクトです。

## 技術構成
- Frontend: Vite + React + TypeScript
- Backend: Node.js + Express + Socket.IO

## ディレクトリ構成
- `client/`: フロントエンド
- `server/`: バックエンド
- `docs/`: 開発ドキュメント

## 開発ルール
- `main` へ直接 push しない
- `feature/...` ブランチで作業する
- 小さく commit する

## 起動方法

### client
```bash
cd client
npm install
npm run dev