# -*- coding: utf-8 -*-
"""
AhaZone 教學資源雲端發布器 (Google Drive Publisher)
--------------------------------------------------
功能：
1. 透過 Google Drive API 自動掃描教材資料夾中的教學 PDF
2. 智慧配對「題目卷 + 詳解卷」或辨識「題解合一卷」
3. 自動清洗並提供乾淨的學生端標題
4. 提供直覺的圖形化視窗 (GUI) 供勾選、自訂標題與章節
5. 一鍵安全發布至 AhaZone 官方教材庫

※ 採用純 Python 標準函式庫，完全不需要 pip install 任何套件！
"""

import os
import sys
import json
import re
import urllib.request
import urllib.parse
from datetime import datetime
import concurrent.futures

# Windows 終端機 UTF-8 編碼相容處理
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# ==========================================
# 核心設定資訊
# ==========================================
API_KEY = 'AIzaSyDJMCs1DLoPCZLAEzuAmVeerBNetX_wpI4'
ROOT_FOLDER_ID = '1fu_i-yZBr6bZipxT5sok_UqLDeenV05n'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RESOURCES_TS_PATH = os.path.join(BASE_DIR, 'src', 'data', 'resources.ts')

IGNORED_FOLDERS = {
    '命題題庫', 'hanlin', 'Database', 'Help', 'Files', '.gemini', 'node_modules', '.git'
}

# 課綱章節快速對應表
CHAPTER_OPTIONS = [
    # 高中物理
    {"label": "高一物理 · 直線運動", "stage": "senior", "grade": "s10-physics", "gradeLabel": "高一物理", "subject": "physics", "subjectLabel": "高中物理", "chapter": "直線運動"},
    {"label": "高一物理 · 物質的組成", "stage": "senior", "grade": "s10-physics", "gradeLabel": "高一物理", "subject": "physics", "subjectLabel": "高中物理", "chapter": "物質的組成與交互作用"},
    {"label": "高一物理 · 牛頓運動定律", "stage": "senior", "grade": "s10-physics", "gradeLabel": "高一物理", "subject": "physics", "subjectLabel": "高中物理", "chapter": "牛頓運動定律"},
    {"label": "高一物理 · 功與動能", "stage": "senior", "grade": "s10-physics", "gradeLabel": "高一物理", "subject": "physics", "subjectLabel": "高中物理", "chapter": "功與動能"},
    {"label": "高一物理 · 電與磁", "stage": "senior", "grade": "s10-physics", "gradeLabel": "高一物理", "subject": "physics", "subjectLabel": "高中物理", "chapter": "電與磁"},
    {"label": "高一物理 · 量子現象", "stage": "senior", "grade": "s10-physics", "gradeLabel": "高一物理", "subject": "physics", "subjectLabel": "高中物理", "chapter": "量子現象"},
    {"label": "高二物理 · 平面運動", "stage": "senior", "grade": "s11-physics", "gradeLabel": "高二物理", "subject": "physics", "subjectLabel": "高中物理", "chapter": "平面運動"},
    {"label": "高二物理 · 牛頓運動定律", "stage": "senior", "grade": "s11-physics", "gradeLabel": "高二物理", "subject": "physics", "subjectLabel": "高中物理", "chapter": "牛頓運動定律"},

    # 高中數學
    {"label": "高一數學 · 數與式", "stage": "senior", "grade": "s10-math", "gradeLabel": "高一數學", "subject": "math", "subjectLabel": "高中數學", "chapter": "數與式"},
    {"label": "高一數學 · 直線與圓", "stage": "senior", "grade": "s10-math", "gradeLabel": "高一數學", "subject": "math", "subjectLabel": "高中數學", "chapter": "直線與圓"},
    {"label": "高一數學 · 多項式函數", "stage": "senior", "grade": "s10-math", "gradeLabel": "高一數學", "subject": "math", "subjectLabel": "高中數學", "chapter": "多項式函數"},
    {"label": "高一數學 · 數列與級數", "stage": "senior", "grade": "s10-math", "gradeLabel": "高一數學", "subject": "math", "subjectLabel": "高中數學", "chapter": "數列與級數"},
    {"label": "高一數學 · 數據分析", "stage": "senior", "grade": "s10-math", "gradeLabel": "高一數學", "subject": "math", "subjectLabel": "高中數學", "chapter": "數據分析"},
    {"label": "高一數學 · 三角比", "stage": "senior", "grade": "s10-math", "gradeLabel": "高一數學", "subject": "math", "subjectLabel": "高中數學", "chapter": "三角比"},
    {"label": "高一數學 · 指數與對數", "stage": "senior", "grade": "s10-math", "gradeLabel": "高一數學", "subject": "math", "subjectLabel": "高中數學", "chapter": "指數與對數"},
    {"label": "高二數學 · 三角函數", "stage": "senior", "grade": "s11-math", "gradeLabel": "高二數學", "subject": "math", "subjectLabel": "高中數學", "chapter": "三角函數"},
    {"label": "高二數學 · 平面向量", "stage": "senior", "grade": "s11-math", "gradeLabel": "高二數學", "subject": "math", "subjectLabel": "高中數學", "chapter": "平面向量"},
    {"label": "高二數學 · 空間概念與空間坐標", "stage": "senior", "grade": "s11-math", "gradeLabel": "高二數學", "subject": "math", "subjectLabel": "高中數學", "chapter": "空間概念與空間坐標"},

    # 國中自然
    {"label": "國二理化 · 光、影像與顏色", "stage": "junior", "grade": "j8-sci", "gradeLabel": "國二理化", "subject": "science", "subjectLabel": "國中自然", "chapter": "光、影像與顏色"},
    {"label": "國二理化 · 波動與聲音", "stage": "junior", "grade": "j8-sci", "gradeLabel": "國二理化", "subject": "science", "subjectLabel": "國中自然", "chapter": "波動與聲音"},
    {"label": "國二理化 · 溫度與熱", "stage": "junior", "grade": "j8-sci", "gradeLabel": "國二理化", "subject": "science", "subjectLabel": "國中自然", "chapter": "溫度與熱"},

    # 國中數學
    {"label": "國一數學 · 標準分解式與分數運算", "stage": "junior", "grade": "j7", "gradeLabel": "國一數學", "subject": "math", "subjectLabel": "國中數學", "chapter": "標準分解式與分數運算"},
    {"label": "國一數學 · 一元一次方程式", "stage": "junior", "grade": "j7", "gradeLabel": "國一數學", "subject": "math", "subjectLabel": "國中數學", "chapter": "一元一次方程式"},
    {"label": "國一數學 · 二元一次聯立方程式", "stage": "junior", "grade": "j7", "gradeLabel": "國一數學", "subject": "math", "subjectLabel": "國中數學", "chapter": "二元一次聯立方程式"}
]

# ==========================================
# 標題清洗與 Google Drive API 掃描
# ==========================================
def clean_student_title(raw_name: str) -> str:
    """自動過濾題庫代號與贅字，產生給學生看的乾淨標題"""
    title = re.sub(r'\.pdf$', '', raw_name, flags=re.IGNORECASE)
    # 移除內部代碼 (如 60707-1, 50219-1)
    title = re.sub(r'^\d{5,}(-\d+)?_?', '', title)
    title = re.sub(r'\(\d{7,}\)', '', title)
    # 移除卷別字眼
    title = re.sub(r'[-_]?(題目卷|解析卷|答案卷|解答卷|練習卷|測試卷|試卷|題目|解析|解答|答案)$', '', title)
    title = re.sub(r'\((解答卷|解析卷|答案卷|題目卷|解答|答案)\)$', '', title)
    title = re.sub(r'（(解答卷|解析卷|答案卷|題目卷|解答|答案)）$', '', title)
    title = re.sub(r'[-_]?(題目卷含解答|題目含解答|題目\+解答卷|題目&解析|題目含|含解答|含解析|\+解答卷|\+解答|&解析)$', '', title)
    # 移除開頭重複的科目與年級
    title = re.sub(r'^(高[一二三]|國[一二三七八九])[上下]?(選修|基礎)?(物理|數學|理化|自然)[I|1]?[-_]?', '', title)
    title = re.sub(r'[-_\s]+$', '', title).strip()
    return title or '精選複習試卷'

def fetch_drive_pdfs(folder_id=ROOT_FOLDER_ID, current_path=""):
    """使用 Python 原生 urllib 與執行緒池快速遞迴掃描雲端硬碟 PDF"""
    results = []

    def crawl_folder(fid, path):
        sub_results = []
        page_token = None
        while True:
            params = {
                'q': f"'{fid}' in parents and trashed = false",
                'key': API_KEY,
                'fields': 'nextPageToken, files(id, name, mimeType)',
                'pageSize': '100'
            }
            if page_token:
                params['pageToken'] = page_token
            url = f"https://www.googleapis.com/drive/v3/files?{urllib.parse.urlencode(params)}"
            req = urllib.request.Request(url, headers={'User-Agent': 'AhaZonePublisher/1.0'})
            try:
                with urllib.request.urlopen(req, timeout=10) as response:
                    data = json.loads(response.read().decode('utf-8'))
            except Exception as e:
                print(f"掃描失敗 [{path}]: {e}")
                return []

            subfolders = []
            for item in data.get('files', []):
                m_type = item.get('mimeType')
                name = item.get('name')
                if m_type == 'application/vnd.google-apps.folder':
                    if name not in IGNORED_FOLDERS:
                        subfolders.append((item.get('id'), f"{path}/{name}"))
                elif m_type == 'application/pdf':
                    sub_results.append({
                        'id': item.get('id'),
                        'name': name,
                        'path': path,
                        'previewUrl': f"https://drive.google.com/file/d/{item.get('id')}/preview"
                    })

            # 平行爬取子資料夾
            if subfolders:
                with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
                    futures = [executor.submit(crawl_folder, s_id, s_path) for s_id, s_path in subfolders]
                    for fut in concurrent.futures.as_completed(futures):
                        sub_results.extend(fut.result())

            page_token = data.get('nextPageToken')
            if not page_token:
                break
        return sub_results

    return crawl_folder(folder_id, current_path)

def group_and_match(pdf_list):
    """分析題目卷、詳解卷與題解合一卷，並自動比對課綱"""
    groups = {}
    for f in pdf_list:
        name = f['name']
        is_combined = bool(re.search(r'(含解答|\+解答|題目&解析|題目含解答)', name))
        is_answer = not is_combined and bool(re.search(r'(解答|解析|答案)', name))

        base_key = re.sub(r'\.pdf$', '', name, flags=re.IGNORECASE)
        if not is_combined:
            base_key = re.sub(r'[-_]?(題目卷|解析卷|答案卷|解答卷|練習卷|測試卷|題目|解析|解答|答案)$', '', base_key)
            base_key = re.sub(r'[\(（](解答卷|解析卷|答案卷|題目卷|解答|答案)[\)）]$', '', base_key).strip()

        if base_key not in groups:
            groups[base_key] = {'base_key': base_key, 'q': None, 'a': None, 'c': None}

        if is_combined:
            groups[base_key]['c'] = f
        elif is_answer:
            groups[base_key]['a'] = f
        else:
            groups[base_key]['q'] = f

    candidates = []
    for base_key, g in groups.items():
        has_pair = g['q'] and g['a']
        is_combined = bool(g['c'])
        if not (has_pair or is_combined):
            continue

        item_type = 'pair' if has_pair else 'combined'
        clean_title = clean_student_title(base_key)

        # 智慧猜測課綱章節
        matched_chapter = None
        for opt in CHAPTER_OPTIONS:
            if opt['chapter'] in base_key or opt['chapter'] in (g['q'] or g['c'] or {}).get('path', ''):
                matched_chapter = opt
                break
        if not matched_chapter:
            for opt in CHAPTER_OPTIONS:
                short_keyword = opt['chapter'][:2]
                if short_keyword in base_key:
                    matched_chapter = opt
                    break

        candidates.append({
            'base_key': base_key,
            'clean_title': clean_title,
            'type': item_type,
            'q': g['q'],
            'a': g['a'],
            'c': g['c'],
            'matched_chapter': matched_chapter or CHAPTER_OPTIONS[0]
        })

    return candidates

# ==========================================
# 寫入 AhaZone resources.ts
# ==========================================
def write_to_resources_ts(selected_items):
    """將使用者勾選並自訂的項目安全寫入 src/data/resources.ts"""
    if not os.path.exists(RESOURCES_TS_PATH):
        raise FileNotFoundError(f"找不到 resources.ts: {RESOURCES_TS_PATH}")

    with open(RESOURCES_TS_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    new_entries = []
    for item in selected_items:
        is_pair = item['type'] == 'pair'
        q_url = item['q']['previewUrl'] if is_pair else item['c']['previewUrl']
        a_url = item['a']['previewUrl'] if is_pair else None
        ch = item['matched_chapter']

        entry = {
            "id": f"res-drive-{hex(int(datetime.now().timestamp() * 1000))[2:]}",
            "title": item['clean_title'],
            "subtitle": f"{ch['gradeLabel']} {ch['chapter']} 精選練習",
            "description": f"精選 {ch['chapter']} 練習卷，透過 Google 雲端即時載入，題目與解析齊備。",
            "type": "pdf-exam" if is_pair else "pdf-paper",
            "stage": ch['stage'],
            "grade": ch['grade'],
            "gradeLabel": ch['gradeLabel'],
            "subject": ch['subject'],
            "subjectLabel": ch['subjectLabel'],
            "chapter": ch['chapter'],
            "tags": [ch['gradeLabel'], ch['chapter'], "含題目與詳解" if is_pair else "題解合一"],
            "filePath": q_url,
            "ahaInsight": "掌握核心觀念與幾何幾何意涵，快速突破常見盲點。",
            "learningGoals": ["掌握考題題型與解法思維", "建立關鍵公式與定理直覺"],
            "featured": False,
            "date": datetime.now().strftime('%Y-%m-%d'),
            "downloads": 0,
            "rating": 5.0
        }
        if a_url:
            entry["answerPath"] = a_url

        new_entries.append(entry)

    # 轉為 JS 物件格式注入
    injection_code = "\n  // --- 由 Python 發布器自動掛載的 Google Drive 資源 ---\n"
    for e in new_entries:
        injection_code += f"  {json.dumps(e, ensure_ascii=False, indent=2).replace(chr(10), chr(10) + '  ')},\n"

    last_bracket = content.rfind('];')
    if last_bracket == -1:
        raise ValueError("在 resources.ts 中找不到 INITIAL_RESOURCES 陣列結尾 ];")

    updated_content = content[:last_bracket] + injection_code + content[last_bracket:]

    with open(RESOURCES_TS_PATH, 'w', encoding='utf-8') as f:
        f.write(updated_content)

    return len(new_entries)

# ==========================================
# 桌面圖形化介面 (Tkinter GUI)
# ==========================================
def launch_gui():
    import tkinter as tk
    from tkinter import ttk, messagebox
    import threading

    root = tk.Tk()
    root.title("AhaZone 教學資源雲端發布器")
    root.geometry("1020x680")
    root.configure(bg="#0f172a")  # Slate-900

    # 樣式設定
    style = ttk.Style()
    style.theme_use('clam')
    style.configure("Treeview", background="#1e293b", foreground="#f8fafc", fieldbackground="#1e293b", rowheight=28)
    style.configure("Treeview.Heading", background="#334155", foreground="#38bdf8", font=('Microsoft JhengHei', 10, 'bold'))

    # 上方操作列
    top_frame = tk.Frame(root, bg="#0f172a", pady=10, padx=15)
    top_frame.pack(fill=tk.X)

    title_label = tk.Label(top_frame, text="AhaZone Google Drive 教學資源發布器", font=('Microsoft JhengHei', 14, 'bold'), bg="#0f172a", fg="#38bdf8")
    title_label.pack(side=tk.LEFT)

    status_var = tk.StringVar(value="點擊「掃描雲端」開始檢索教材...")
    status_label = tk.Label(top_frame, textvariable=status_var, font=('Microsoft JhengHei', 9), bg="#0f172a", fg="#94a3b8")
    status_label.pack(side=tk.RIGHT)

    # 主分割視窗 (左側清單 / 右側編輯)
    paned = tk.PanedWindow(root, orient=tk.HORIZONTAL, bg="#334155", bd=0)
    paned.pack(fill=tk.BOTH, expand=True, padx=15, pady=5)

    left_frame = tk.Frame(paned, bg="#1e293b")
    paned.add(left_frame, width=580)

    right_frame = tk.Frame(paned, bg="#0f172a", padx=15, pady=10)
    paned.add(right_frame, width=440)

    # 左側 Treeview 清單
    columns = ("status", "title", "type", "raw")
    tree = ttk.Treeview(left_frame, columns=columns, show="headings", selectmode="browse")
    tree.heading("status", text="狀態")
    tree.heading("title", text="學生端標題")
    tree.heading("type", text="卷別")
    tree.heading("raw", text="原檔名關鍵字")

    tree.column("status", width=50, anchor=tk.CENTER)
    tree.column("title", width=220)
    tree.column("type", width=90, anchor=tk.CENTER)
    tree.column("raw", width=200)

    tree_scroll = ttk.Scrollbar(left_frame, orient=tk.VERTICAL, command=tree.yview)
    tree.configure(yscrollcommand=tree_scroll.set)
    tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
    tree_scroll.pack(side=tk.RIGHT, fill=tk.Y)

    # 右側編輯表單
    tk.Label(right_frame, text="教材展示設定 (可自訂)", font=('Microsoft JhengHei', 12, 'bold'), bg="#0f172a", fg="#f1f5f9").pack(anchor=tk.W, pady=(0, 10))

    tk.Label(right_frame, text="學生端顯示標題：", font=('Microsoft JhengHei', 9, 'bold'), bg="#0f172a", fg="#94a3b8").pack(anchor=tk.W)
    title_entry = tk.Entry(right_frame, font=('Microsoft JhengHei', 10), bg="#1e293b", fg="#ffffff", insertbackground="white")
    title_entry.pack(fill=tk.X, pady=(2, 10))

    tk.Label(right_frame, text="掛載目標章節：", font=('Microsoft JhengHei', 9, 'bold'), bg="#0f172a", fg="#94a3b8").pack(anchor=tk.W)
    chapter_combo = ttk.Combobox(right_frame, values=[opt['label'] for opt in CHAPTER_OPTIONS], state="readonly", font=('Microsoft JhengHei', 9))
    chapter_combo.pack(fill=tk.X, pady=(2, 10))

    tk.Label(right_frame, text="原始檔案配對詳情：", font=('Microsoft JhengHei', 9, 'bold'), bg="#0f172a", fg="#94a3b8").pack(anchor=tk.W)
    detail_text = tk.Text(right_frame, height=8, bg="#1e293b", fg="#cbd5e1", font=('Consolas', 9), relief=tk.FLAT)
    detail_text.pack(fill=tk.X, pady=(2, 15))

    # 資料狀態
    candidates_data = []
    selected_indices = set()

    def update_detail_view(event):
        selected_item = tree.focus()
        if not selected_item:
            return
        idx = int(tree.item(selected_item, "text"))
        c = candidates_data[idx]
        title_entry.delete(0, tk.END)
        title_entry.insert(0, c['clean_title'])

        ch_label = c['matched_chapter']['label']
        if ch_label in chapter_combo['values']:
            chapter_combo.set(ch_label)

        detail_text.delete("1.0", tk.END)
        if c['type'] == 'pair':
            detail_text.insert(tk.END, f"【成對雙卷】\n題目卷: {c['q']['name']}\n詳解卷: {c['a']['name']}")
        else:
            detail_text.insert(tk.END, f"【題解合一卷】\n完整卷: {c['c']['name']}")

    tree.bind("<<TreeviewSelect>>", update_detail_view)

    def toggle_item_by_id(item):
        if not item:
            return
        idx = int(tree.item(item, "text"))
        if idx in selected_indices:
            selected_indices.remove(idx)
            tree.set(item, "status", "[  ]")
        else:
            selected_indices.add(idx)
            tree.set(item, "status", "[ ✔ ]")

    def on_space_key(event):
        item = tree.focus()
        if item:
            toggle_item_by_id(item)
            return "break"

    def on_single_click(event):
        # 點擊在第 1 欄 (狀態欄) 立即切換勾選
        region = tree.identify_region(event.x, event.y)
        col = tree.identify_column(event.x)
        item = tree.identify_row(event.y)
        if region == "cell" and col == "#1" and item:
            toggle_item_by_id(item)

    def on_double_click(event):
        item = tree.identify_row(event.y)
        if item:
            toggle_item_by_id(item)

    tree.bind("<space>", on_space_key)
    tree.bind("<Button-1>", on_single_click, add="+")
    tree.bind("<Double-1>", on_double_click)

    def save_current_edit():
        selected_item = tree.focus()
        if not selected_item:
            return
        idx = int(tree.item(selected_item, "text"))
        new_title = title_entry.get().strip()
        ch_label = chapter_combo.get()
        if new_title:
            candidates_data[idx]['clean_title'] = new_title
            tree.set(selected_item, "title", new_title)
        for opt in CHAPTER_OPTIONS:
            if opt['label'] == ch_label:
                candidates_data[idx]['matched_chapter'] = opt
                break

    title_entry.bind("<FocusOut>", lambda e: save_current_edit())
    chapter_combo.bind("<<ComboboxSelected>>", lambda e: save_current_edit())

    # 執行掃描 (背景執行緒避免卡畫面)
    def run_scan():
        status_var.set("正在掃描 Google Drive，約需 2~3 秒...")
        tree.delete(*tree.get_children())
        candidates_data.clear()
        selected_indices.clear()

        def worker():
            try:
                pdf_list = fetch_drive_pdfs()
                candidates = group_and_match(pdf_list)
                candidates_data.extend(candidates)

                def update_ui():
                    for i, c in enumerate(candidates_data):
                        t_label = "雙卷(題+解)" if c['type'] == 'pair' else "題解合一"
                        tree.insert("", tk.END, text=str(i), values=("[  ]", c['clean_title'], t_label, c['base_key']))
                    status_var.set(f"✔ 掃描完成！共發現 {len(candidates_data)} 組可用教材。【按空白鍵 Space】或【點擊狀態欄】即可切換勾選！")

                root.after(0, update_ui)
            except Exception as e:
                root.after(0, lambda: messagebox.showerror("掃描錯誤", str(e)))

        threading.Thread(target=worker, daemon=True).start()

    # 執行一鍵發布
    def do_publish():
        save_current_edit()
        if not selected_indices:
            messagebox.showwarning("提示", "您尚未勾選任何要發布的教材！\n(請選取項目後「按空白鍵 Space」或「點擊狀態欄」進行勾選)")
            return

        to_publish = [candidates_data[i] for i in selected_indices]
        msg = f"即將把以下 {len(to_publish)} 份教材寫入 AhaZone：\n\n"
        for item in to_publish:
            msg += f"• 【{item['matched_chapter']['chapter']}】{item['clean_title']}\n"
        msg += "\n請問是否確定發布？"

        if messagebox.askyesno("確認發布", msg):
            try:
                count = write_to_resources_ts(to_publish)
                messagebox.showinfo("發布成功", f"成功寫入 {count} 筆資源至 resources.ts！\n學生端點擊即可透過 Google Drive 串流即時預覽。")
            except Exception as e:
                messagebox.showerror("寫入失敗", str(e))

    # 下方按鈕控制列
    bottom_frame = tk.Frame(root, bg="#0f172a", pady=12, padx=15)
    bottom_frame.pack(fill=tk.X)

    btn_scan = tk.Button(bottom_frame, text="重新掃描雲端", command=run_scan, font=('Microsoft JhengHei', 9, 'bold'), bg="#334155", fg="#ffffff", padx=12, pady=6, relief=tk.FLAT)
    btn_scan.pack(side=tk.LEFT)

    btn_select_all = tk.Button(bottom_frame, text="全選推薦項目", command=lambda: [selected_indices.add(i) or tree.set(item, "status", "[ V ]") for i, item in enumerate(tree.get_children()) if candidates_data[i]['matched_chapter']], font=('Microsoft JhengHei', 9), bg="#1e293b", fg="#94a3b8", padx=10, pady=6, relief=tk.FLAT)
    btn_select_all.pack(side=tk.LEFT, padx=10)

    btn_publish = tk.Button(bottom_frame, text="一鍵寫入 AhaZone 教材庫", command=do_publish, font=('Microsoft JhengHei', 10, 'bold'), bg="#0284c7", fg="#ffffff", padx=18, pady=6, relief=tk.FLAT)
    btn_publish.pack(side=tk.RIGHT)

    # 啟動時自動掃描一次
    root.after(300, run_scan)
    root.mainloop()

# ==========================================
# 終端機純文字模式 (CLI 模式)
# ==========================================
def run_cli():
    print("\n[AhaZone 教學資源發布器 - Python CLI 模式]")
    print("正在掃描 Google Drive...")
    pdfs = fetch_drive_pdfs()
    candidates = group_and_match(pdfs)
    print(f"掃描完成！共發現 {len(candidates)} 組教材。\n")
    for i, c in enumerate(candidates[:15]):
        t = "雙卷" if c['type'] == 'pair' else "合一"
        print(f"[{i+1}] [{t}] 【{c['matched_chapter']['label']}】{c['clean_title']}")
        if c['type'] == 'pair':
            print(f"     題目: {c['q']['name']}\n     詳解: {c['a']['name']}")
        else:
            print(f"     完整: {c['c']['name']}")

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--cli':
        run_cli()
    else:
        launch_gui()
