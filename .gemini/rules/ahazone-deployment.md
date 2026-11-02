# AhaZone 自主更新與部署原則

## 專案核心資訊
- 專案名稱：悟境 ｜ AhaZone
- 本地路徑：`D:\Google 雲端硬碟\AhaZone`
- 架構：Vue 3 + TypeScript + Vite + Tailwind CSS
- 遠端儲存庫：`https://github.com/w8s3suimin/AhaZone`
- 認證狀態：本地 Git Remote 已永久綁定 GitHub Fine-grained Personal Access Token，具備專屬 `w8s3suimin/AhaZone` 之代碼與內容讀寫權限。

## 自主更新標準作業流程（SOP）
當使用者要求新增教材、試卷或調整內容時，助理應自主完成下列流程：
1. **靜態資源存放**：
   - 動態 3D / HTML5 模擬檔 ➜ `public/simulations/`
   - 題目卷與解析卷 PDF ➜ `public/papers/`
2. **資料庫登記**：
   - 於 `src/data/resources.ts` 依據 108 課綱單元格式登記。
3. **驗證建置**：
   - 執行 `npm run build` 確認無任何語法或型別錯誤。
4. **自動推播**：
   - 於 `D:\Google 雲端硬碟\AhaZone` 執行：
     ```bash
     git add .
     git commit -m "<清晰的繁體中文更新說明>"
     git push origin main
     ```
   - 推送成功後，Vercel 將自動觸發 CI/CD 即時發布至正式上線網站。
