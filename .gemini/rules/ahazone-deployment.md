# AhaZone 自主更新與部署原則

## 專案核心資訊
- 專案名稱：悟境 ｜ AhaZone
- 本地路徑：`D:\Google 雲端硬碟\AhaZone`
- 線上正式網址：`https://aha-zone.vercel.app`
- GitHub 儲存庫：`https://github.com/w8s3suimin/AhaZone`
- Vercel 專案名稱：`aha-zone` (Project ID: `prj_JP5dmZJzhgdGMAzHdht0HUEyDwuQ`)
- 金鑰憑證狀態：
  - GitHub Fine-grained PAT：已驗證，已配置於本地 Git Remote，具備專屬代碼推送權限。
  - Vercel Access Token：已驗證，已儲存於本地安全環境變數檔 `.env.local`。

## 自主更新標準作業流程（SOP）
當使用者要求新增教材、試卷或調整內容時，助理自主完成下列流程：
1. **靜態資源存放**：
   - 動態 3D / HTML5 模擬檔 ➜ `public/simulations/`
   - 題目卷與解析卷 PDF ➜ `public/papers/`
2. **資料庫登記**：
   - 於 `src/data/resources.ts` 依據 108 課綱單元格式登記（含標籤、Aha! 頓悟提示與學習目標）。
3. **驗證建置**：
   - 執行 `npm run build` 確認無任何語法或型別錯誤。
4. **自動推播與即時發布**：
   - 於 `D:\Google 雲端硬碟\AhaZone` 執行：
     ```bash
     git add .
     git commit -m "<清晰的繁體中文更新說明>"
     git push origin main
     ```
   - GitHub 收到推播後會自動通知 Vercel CI/CD 即時重新建置並部署至 `https://aha-zone.vercel.app`。
   - 若需手動強制觸發或查詢狀態，可讀取 `.env.local` 中的 `VERCEL_TOKEN` 呼叫 Vercel REST API。
