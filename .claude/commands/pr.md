以下のルールに従ってプルリクエストを作成してください：

1. `git status` と `git log origin/main..HEAD` で変更内容を確認
2. 未コミットの変更があれば先にコミット（/commit を使用）
3. `git push -u origin <branch>` でリモートにプッシュ
4. `gh pr create` でプルリクエストを作成

プルリクエストの形式:
- タイトル: 短い日本語（命令形、50文字以内）
- 本文: 日本語
  - ## Summary: 変更内容を1-3行で説明
  - ## Changes: 主な変更点を箇条書き
  - ## Test: テスト方法や確認事項

例:
```
gh pr create --title "ヒグマ出没ヒートマップを追加" --body "$(cat <<'EOF'
## Summary
ヒグマ出没データの密度をヒートマップで可視化する機能を追加。

## Changes
- Cesiumプリミティブを使用したヒートマップレイヤーを追加
- JSONから出没データを読み込み・処理

## Test
- `npm run dev` でヒートマップが正しく表示されることを確認
EOF
)"
```

注意事項:
- main ブランチに直接 PR を作成
- ドラフト PR にする場合は `--draft` オプションを追加
- 作成後、PR の URL を表示すること
