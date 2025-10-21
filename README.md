# Paper Network Explorer

学術論文ネットワーク可視化 - Semantic Scholar APIを活用したインタラクティブな2D引用ネットワーク

![Paper Network Explorer](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 概要

Paper Network Explorerは、学術論文の引用関係をインタラクティブな2Dグラフで可視化するWebアプリケーションです。[Connected Papers](https://www.connectedpapers.com/)にインスパイアされ、Semantic Scholar APIを使用して2億件以上の論文とその引用関係にアクセスします。

## 主な機能

- **論文検索**: タイトル、DOI、ArXiv ID、Semantic Scholar IDで検索可能
- **インタラクティブな2Dネットワークグラフ**: 力指向グラフによる引用関係の可視化
- **年代別カラーリング**: ノードを緑（古い論文）から青（新しい論文）のグラデーションで色分け
- **被引用数によるノードサイズ調整**: 被引用数が多いほど大きなノードで表示
- **3カラムレイアウト**: 
  - 左: 関連論文リスト
  - 中央: インタラクティブなネットワークグラフ
  - 右: 選択した論文の詳細情報
- **ダーク/ライトテーマ**: テーマの切り替えが可能

## 技術スタック

- **フロントエンド**: React 19, TypeScript, Tailwind CSS, shadcn/ui
- **バックエンド**: Node.js, tRPC, Express
- **グラフ可視化**: react-force-graph-2d
- **ルーティング**: Wouter
- **API**: Semantic Scholar API

## インストール

```bash
# 依存パッケージのインストール
pnpm install

# 開発サーバーの起動
pnpm dev

# 本番用ビルド
pnpm build
```

## 使い方

1. 検索ボックスに論文タイトル、DOI、またはSemantic Scholar IDを入力
2. 「探索」ボタンをクリック
3. 中央パネルで引用ネットワークを確認
4. ノードをクリックして論文の詳細を表示
5. ノードを右クリックしてその論文のネットワークに移動

## プロジェクト構造

```
paper-network/
├── client/src/
│   ├── pages/          # ページコンポーネント
│   ├── components/     # 再利用可能なコンポーネント
│   ├── contexts/       # Reactコンテキスト
│   └── App.tsx         # メインアプリコンポーネント
├── server/
│   ├── routers.ts      # tRPCルーター
│   └── _core/          # サーバーコア
└── shared/
    └── const.ts        # 共有定数
```

## API

このプロジェクトは[Semantic Scholar API](https://api.semanticscholar.org/)を使用して論文データと引用情報を取得しています。

## スクリーンショット

### ホームページ
タイトル、DOI、またはSemantic Scholar IDで論文を検索できます。

### ネットワーク可視化
年代別カラーリングによる引用関係のインタラクティブな2Dグラフ表示。

## 今後の拡張予定

- 検索履歴のためのデータベース統合
- ユーザー認証機能
- 高度なフィルタリング（年代、分野、被引用数）
- エクスポート機能（PNG、SVG、JSON）
- 日本語論文対応（医中誌Web、J-STAGE、CiNii）

## ライセンス

MIT License

## 謝辞

- [Semantic Scholar](https://www.semanticscholar.org/) - APIの提供
- [Connected Papers](https://www.connectedpapers.com/) - インスピレーション
- [react-force-graph](https://github.com/vasturiano/react-force-graph) - グラフ可視化

## 作者

[tomiyuta](https://github.com/tomiyuta)

