# 悟境 ｜ AhaZone (Vue 3 旗艦版)

> **點亮每一次恍然大悟的頓悟時刻**  
> 專為台灣國中、高中 108 課綱數理體系打造的動態直觀學習與複習題庫資源庫。  
> 架構：**Vue 3 (Composition API) + Vite + TypeScript + Tailwind CSS**

---

## 🌟 專案核心特色

1. **依據 108 課綱階層單元導覽**
   - 國中：七年級、八年級、九年級（數學、理化、生物、自然）
   - 高中：高一、高二（數A / 數B / 選修物理）、高三（數甲 / 數乙 / 選修物理 / 分科總複習）
   - 點擊左側單元地圖即可單元快篩，支援即時關鍵字搜尋與學段切換。

2. **動態 3D 幾何模擬實驗室**
   - 內建 Three.js 解析級互動實驗室：**雙圓錐截面全域幾何分析 (108課綱高二數B「圓錐截面」專屬 3D 空間幾何解析)**。
   - 支援 3D 空間沙漏錐面自由旋轉縮放、2D 投影切換、計算漸近線夾角、臨界平行母線拋物線（θ=45°）與動態指標。
   - 附帶「**💡 悟境頓悟指引 (Aha! Guide)**」教學卡。

3. **雙卷對照 PDF 預覽與下載系統**
   - 內嵌瀏覽器原生 PDF 檢視器，一鍵在「題目卷」與「詳解卷」之間切換。
   - 提供快速下載按鈕與各單元解題心法點撥。

---

## 🚀 本地開發與預覽

### 1. 安裝相依套件
```bash
cd "D:\Google 雲端硬碟\AhaZone"
npm install
```

### 2. 啟動本機開發伺服器
```bash
npm run dev
```
瀏覽器開啟：`http://localhost:3000`

### 3. 編譯正式發布版本
```bash
npm run build
```
成果位於 `dist/`。

---

## ☁️ 部署到 GitHub 與 Vercel 步驟指引

### 步驟 A：在 GitHub 建立儲存庫並推送

1. 開啟 [GitHub.com](https://github.com) 登入帳號，點擊右上角 **New repository**。
2. Repository name 填寫 `ahazone`（可選 Public 或 Private），**不要**勾選 Initialize with README。
3. 點擊 **Create repository**。
4. 在 PowerShell 中執行下列指令（將 `<your-username>` 替換為您的 GitHub 帳號）：

```bash
cd "D:\Google 雲端硬碟\AhaZone"
git init
git add .
git commit -m "Initial commit: 悟境 ｜ AhaZone Vue 3 版"
git branch -M main
git remote add origin https://github.com/<your-username>/ahazone.git
git push -u origin main
```

---

### 步驟 B：在 Vercel 連結 GitHub 一鍵上線

1. 前往 [Vercel.com](https://vercel.com)（使用 GitHub 帳號直接登入）。
2. 點擊 **Add New...** -> **Project**。
3. 在 Import Git Repository 列表中，找到 `ahazone`，點擊 **Import**。
4. Vercel 會自動辨識出 **Vite** 框架：
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. 點擊 **Deploy**，約 30 秒至 1 分鐘後即可獲得專屬網址（例如 `https://ahazone.vercel.app`）！
6. 未來只要您在本地新增檔案或更新題目，執行 `git add .`、`git commit -m "update"`、`git push`，Vercel 就會**自動觸發即時重新部署發布**。

---

## 📂 如何新增教學資源？

### 1. 新增動態 3D / HTML5 模擬教材
1. 將做好的 HTML 檔案放入 `public/simulations/`（例如 `public/simulations/projectile.html`）。
2. 在 `src/data/resources.ts` 中新增一筆資料，將 `filePath` 指向該檔案。

### 2. 新增段考複習卷 / 講義 PDF
1. 將題目卷與解析卷 PDF 放入 `public/papers/` 目錄。
2. 在 `src/data/resources.ts` 中新增資料，設定 `filePath` 與 `answerPath`。
