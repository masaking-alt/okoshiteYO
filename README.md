# okoshiteYO

絶対起こすマンなアラームアプリの React Native (Expo) プロトタイプ。UIが中心で、ネイティブアラーム連携はこれから実装する段階です。Androidのみ対象（iOSフォルダは削除済み）。

## コンセプトと機能
- 対象: 朝起きられない学生 / 遅刻できない社会人 (20〜50歳)
- 解除手段: 計算チャレンジ / シェイク / 位置付き写真（拒否時は計算/シェイクに自動フォールバック）
- スヌーズなし、曜日繰り返しあり、シンプル操作
- DND中でも鳴らす方針、バッテリー最適化は必要時のみ案内

## 画面構成
- Home: アラーム一覧、設定ボタン、追加FAB (`HomeScreen.tsx`)
- Editor: 時刻・曜日・アクション・モード設定 (`EditorScreen.tsx`)
- Settings: デフォルトアクション、権限ステータス表示、音源選択など (`SettingsScreen.tsx`)
- Action Preview: 各解除アクションのUIプレビュー (`ActionPreviewScreen.tsx`)
- Alarm Fire (デモ/本番想定): Math/Shake/Photo で分割、共通レイアウトとRouterで切替
  - 共通レイアウト: `components/AlarmFireLayout.tsx`
  - ルーター: `screens/AlarmFireRouter.tsx`（`AlarmDemoScreen.tsx` から呼び出し）
  - モード別: `AlarmMathScreen.tsx` / `AlarmShakeScreen.tsx` / `AlarmPhotoScreen.tsx`

## 権限方針（Android）
- 正確なアラーム: `SCHEDULE_EXACT_ALARM` / `USE_EXACT_ALARM`（作成時に確認、拒否なら保存ブロック）
- 通知: `POST_NOTIFICATIONS`（作成時に確認、拒否なら保存ブロック）
- DND貫通: `ACCESS_NOTIFICATION_POLICY`（作成時に案内、拒否なら「DND中は鳴らない」と表示）
- 写真解除: `CAMERA` + `ACCESS_FINE_LOCATION`（写真モード選択時のみ、拒否なら計算/シェイクにフォールバック）
- 保存先: 写真はアプリ内キャッシュで解除後削除、音源は端末デフォルト or SAFで取得（追加ストレージ権限なし）
- バッテリー最適化除外: 遅延が疑われるときだけ案内

## ネイティブ運用
- Androidのみ手動管理。`app.json` の設定は自動同期されないため、Manifest/Gradleを直接編集する。
- 画面向きを固定する場合は `android/app/src/main/AndroidManifest.xml` の `MainActivity` に `android:screenOrientation="portrait"` を設定。
- `app.json` の `ios` ブロックは削除済み。

## 開発手順
1. 依存インストール（Node 18+）: `npm install`
2. Expo CLI を用意する（未インストールならどちらかを選択）
   - プロジェクトローカルで使う: `npx expo --version` で確認し、各コマンドを `npx expo ...` で実行
   - グローバルに入れる: `npm install -g expo-cli`
3. 開発サーバー起動: `npm start`（内部で `npx expo start` を呼ぶ。トンネルは `npm start -- --tunnel`）
4. Androidで動作確認（iOSは対象外）

## ディレクトリと担当の目安
- `App.tsx` … 画面遷移と状態管理
- `src/data/alarms.ts` … モックデータとアクションメタ
- `src/theme/colors.ts` … カラーパレット
- `src/components/AlarmCard.tsx` … 一覧カード
- `src/components/AlarmFireLayout.tsx` … 発火画面共通枠
- `src/screens/*` … 各画面（上記「画面構成」参照）
- `src/screens/fire/types.ts` … 発火画面で共有する型

## 今後の実装メモ（Androidネイティブ側）
- AlarmManager + Foreground Service で発火→フルスクリーンActivityを起動（WAKE_LOCKは短時間）
- 通知チャネル/フルスクリーンIntent設定、DND許可誘導、exact alarm 許可チェック
- 写真モードはカメラ/位置権限が無い場合は保存時点で代替アクションに差し替える
