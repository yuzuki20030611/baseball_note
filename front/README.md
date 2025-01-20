# 目次
1. [環境構築](#環境構築)
2. [ログイン](#ログイン)

# 環境構築

### 依存関係をインストール
```bash
yarn install
```

### 環境変数
.env.localを作成し、.env.sampleの内容をコピー。

### ローカル起動

```bash
yarn dev
```

### APIの呼び出しhooks更新手順

1. ローカルでバックエンドを起動
2. http://localhost:8080/openapi.json にアクセス
3. コピーし、back/openapi.jsonを上書き保存
4. frontディレクトリに移動し、以下のコマンドを実行
```bash
yarn generate-api
```
