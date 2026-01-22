# 鉄鋼スラグ路盤材 配合シミュレーション アプリ

## 概要
最大5種類の鉄鋼スラグ原料をブレンドし、指定された製品粒度規格（HMS-25など）に適合するかをシミュレーションするWebアプリケーションです。

-   粒度試験結果と配合率から、ブレンド後の粒度分布を自動計算
-   製品規格（上限・下限）との比較をグラフと表で視覚的に確認
-   入力データはブラウザに自動保存

## セットアップ手順

### 1. GitHubへのデプロイ

1.  **GitHubリポジトリの作成:**
    *   GitHub上で新しいリポジトリを作成します（例: `slag-blending-simulator`）。
2.  **ローカルのコードをプッシュ:**
    *   ターミナルを開き、このプロジェクトの `slag-blending-simulator` ディレクトリに移動します。
    *   以下のコマンドを実行して、コードをGitHubリポジトリにプッシュします。
        ```bash
        git init
        git add .
        git commit -m "Initial commit"
        git branch -M main
        git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
        git push -u origin main
        ```
    *   `YOUR_USERNAME` と `YOUR_REPOSITORY_NAME` はご自身のものに置き換えてください。

### 2. Renderでの公開 (Static Site)

1.  **Renderにサインアップ/ログイン:**
    *   [Render](https://render.com/) にアクセスし、GitHubアカウントでログインします。
2.  **新しいStatic Siteの作成:**
    *   ダッシュボードで、「New +」ボタンをクリックし、「Static Site」を選択します。
    *   先ほど作成したGitHubリポジトリ (`slag-blending-simulator`) を選択し、「Connect」をクリックします。
3.  **デプロイ設定:**
    *   以下の通りに設定します。
        *   **Name:** アプリケーションの名前（例: `slag-blending-simulator`）
        *   **Root Directory:** `slag-blending-simulator` （リポジトリのルートに `package.json` がない場合、サブディレクトリを指定します）
        *   **Build Command:** `npm install && npm run build`
        *   **Publish Directory:** `slag-blending-simulator/dist`
4.  **デプロイの実行:**
    *   「Create Static Site」ボタンをクリックすると、デプロイが自動的に開始されます。
    *   ビルドが完了すると、提供されたURL（例: `https---slag-blending-simulator.onrender.com`）でアプリケーションにアクセスできるようになります。

## 規格データを修正する方法

製品の粒度規格は、プロジェクト内の `src/specs.ts` ファイルで一元管理されています。

### 修正場所
-   ファイルパス: `slag-blending-simulator/src/specs.ts`

### 修正方法
このファイル内の `PRODUCT_SPECS` という定数を直接編集します。

**例：`HMS-25` の規格値を変更する場合**

```typescript
export const PRODUCT_SPECS = {
  "HMS-25": {
    name: "HMS-25 (鉄鋼スラグ路盤材)",
    sieves: [
      // この部分の数値を変更します
      { mm: 31.5, lower: 100, upper: 100 },
      { mm: 26.5, lower: 95, upper: 100 },
      { mm: 13.2, lower: 60, upper: 80 }, // 例: upperを85に変更 -> { mm: 13.2, lower: 60, upper: 85 }
      { mm: 4.75, lower: 35, upper: 60 },
      { mm: 2.36, lower: 10, upper: 25 },
      { mm: 0.425, lower: 3, upper: 10 },
    ],
  },
  // ... 他の規格 ...
} as const;
```

-   **`mm`**: ふるいのサイズ (mm)
-   **`lower`**: 規格の下限値 (%)
-   **`upper`**: 規格の上限値 (%)

### 新しい規格を追加する場合

`PRODUCT_SPECS` オブジェクトに新しいキーと値を追加します。

```typescript
export const PRODUCT_SPECS = {
  // ... 既存の規格 ...
  "NEW-SPEC-30": { // 1. 新しい規格ID (ユニークなもの)
    name: "新規格-30 (サンプル)", // 2. 画面に表示される名前
    sieves: [ // 3. ふるいのデータ配列
      { mm: 31.5, lower: 100, upper: 100 },
      { mm: 26.5, lower: 95, upper: 100 },
      // ... 必要なふるいデータを追加 ...
    ],
  },
} as const;
```

ファイルを保存すると、アプリケーションは自動的に新しい規格を認識し、選択肢として表示します。
変更を公開するには、ファイルを編集・コミットし、再度GitHubにプッシュしてください。RenderはGitHubの変更を検知して自動的に再デプロイします。
