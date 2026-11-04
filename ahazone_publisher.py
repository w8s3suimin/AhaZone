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
import subprocess

# Windows 終端機 UTF-8 編碼相容處理
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# ==========================================
# 核心設定資訊與環境變數載入
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def _load_env_file(filepath):
    if not os.path.exists(filepath):
        return
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                k, v = line.split('=', 1)
                k = k.strip()
                v = v.strip().strip('"\'')
                if k and k not in os.environ:
                    os.environ[k] = v
    except Exception:
        pass

# 嘗試載入本地 .env
_load_env_file(os.path.join(BASE_DIR, '.env'))

API_KEY = os.environ.get('GOOGLE_DRIVE_API_KEY', '')
ROOT_FOLDER_ID = '1fu_i-yZBr6bZipxT5sok_UqLDeenV05n'
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
    title = re.sub(r'[-_]?(題目卷|解析卷|答案卷|解答卷|練習卷|測試卷|試卷|詳解卷|題目|解析|解答|答案|詳解)$', '', title)
    title = re.sub(r'[\(（](解答卷|解析卷|答案卷|題目卷|詳解卷|練習卷|解答|答案|詳解)[\)）]$', '', title)
    title = re.sub(r'[-_]?(題目卷含解答|題目含解答|題目\+解答卷|題目&解析|題目暨解析|題目含|含解答|含解析|\+解答卷|\+解答|&解析)$', '', title)
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
        path = f['path']
        is_combined = bool(re.search(r'(含解答|\+解答|題目&解析|題目含解答|題目暨解析)', name))
        is_answer = not is_combined and bool(re.search(r'(解答|解析|答案|詳解)', name))

        base_key = re.sub(r'\.pdf$', '', name, flags=re.IGNORECASE)
        if not is_combined:
            base_key = re.sub(r'[-_]?(題目卷|解析卷|答案卷|解答卷|練習卷|測試卷|試卷|詳解卷|題目|解析|解答|答案|詳解)([\(（][^()（）]+[\)）])?$', '', base_key)
            base_key = re.sub(r'[\(（](解答卷|解析卷|答案卷|題目卷|詳解卷|練習卷|解答|答案|詳解)[\)）]$', '', base_key).strip()

        group_key = (path, base_key)
        if group_key not in groups:
            groups[group_key] = {'path': path, 'base_key': base_key, 'q': None, 'a': None, 'c': None}

        if is_combined:
            groups[group_key]['c'] = f
        elif is_answer:
            if not groups[group_key]['a']:
                groups[group_key]['a'] = f
        else:
            if not groups[group_key]['q']:
                groups[group_key]['q'] = f

    candidates = []
    for (path, base_key), g in groups.items():
        has_pair = bool(g['q'] and g['a'])
        is_combined = bool(g['c'])
        has_single = bool(g['q'] or g['c'] or g['a'])
        if not has_single:
            continue
        # 若非配對且無合一卷，但僅有孤立解析卷且不在根目錄，則忽略
        if not has_pair and not is_combined and not g['q'] and path != '':
            continue

        if has_pair:
            item_type = 'pair'
        elif is_combined:
            item_type = 'combined'
        else:
            item_type = 'single'

        clean_title = clean_student_title(base_key)

        # 智慧猜測課綱章節 (結合路徑與檔名)
        matched_chapter = None
        search_scope = f"{path} {base_key}"
        for opt in CHAPTER_OPTIONS:
            if opt['chapter'] in search_scope:
                matched_chapter = opt
                break
        if not matched_chapter:
            for opt in CHAPTER_OPTIONS:
                short_keyword = opt['chapter'][:2]
                if short_keyword in search_scope:
                    matched_chapter = opt
                    break

        candidates.append({
            'base_key': base_key,
            'clean_title': clean_title,
            'type': item_type,
            'path': path,
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
        is_combined = item['type'] == 'combined'
        q_file = item['q'] if item.get('q') else (item.get('c') or item.get('a'))
        q_url = q_file['previewUrl'] if q_file else ""
        a_url = item['a']['previewUrl'] if (is_pair and item.get('a')) else None
        ch = item['matched_chapter']

        if is_pair:
            desc = f"精選 {ch['gradeLabel']} {ch['chapter']} 單元重點練習卷，含完整題目卷與詳解卷，可線上預覽或下載列印。"
            sub = f"{ch['gradeLabel']} · {ch['chapter']} 題目與詳解"
        elif is_combined:
            desc = f"精選 {ch['gradeLabel']} {ch['chapter']} 單元精選練習（題解合一版），附詳細解答步驟。"
            sub = f"{ch['gradeLabel']} · {ch['chapter']} 題解合一卷"
        else:
            desc = f"精選 {ch['gradeLabel']} {ch['chapter']} 單元實戰練習試卷，可線上預覽或下載列印。"
            sub = f"{ch['gradeLabel']} · {ch['chapter']} 精選試卷"

        entry = {
            "id": f"res-drive-{hex(int(datetime.now().timestamp() * 1000))[2:]}",
            "title": item['clean_title'],
            "subtitle": sub,
            "description": desc,
            "type": "pdf-exam" if is_pair else "pdf-lecture",
            "stage": ch['stage'],
            "grade": ch['grade'],
            "gradeLabel": ch['gradeLabel'],
            "subject": ch['subject'],
            "subjectLabel": ch['subjectLabel'],
            "chapter": ch['chapter'],
            "tags": [ch['gradeLabel'], ch['chapter'], "含題目與詳解" if is_pair else ("題解合一" if is_combined else "精選試卷")],
            "filePath": q_url,
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

    prefix = content[:last_bracket].rstrip()
    leading_comma = ",\n" if not (prefix.endswith(',') or prefix.endswith('[')) else "\n"
    updated_content = prefix + leading_comma + injection_code.lstrip('\n') + content[last_bracket:]

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
    root.geometry("1160x720")
    root.configure(bg="#0f172a")  # Slate-900

    # 樣式設定
    style = ttk.Style()
    style.theme_use('clam')
    style.configure("Treeview", background="#1e293b", foreground="#f8fafc", fieldbackground="#1e293b", rowheight=28, font=('Microsoft JhengHei', 9))
    style.configure("Treeview.Heading", background="#334155", foreground="#38bdf8", font=('Microsoft JhengHei', 9, 'bold'))
    style.map("Treeview", background=[('selected', '#0284c7')], foreground=[('selected', '#ffffff')])

    # 上方操作列
    top_frame = tk.Frame(root, bg="#0f172a", pady=10, padx=15)
    top_frame.pack(fill=tk.X)

    title_label = tk.Label(top_frame, text="AhaZone Google Drive 教學資源發布器", font=('Microsoft JhengHei', 14, 'bold'), bg="#0f172a", fg="#38bdf8")
    title_label.pack(side=tk.LEFT)

    status_var = tk.StringVar(value="點擊「掃描雲端」開始檢索教材...")
    status_label = tk.Label(top_frame, textvariable=status_var, font=('Microsoft JhengHei', 9), bg="#0f172a", fg="#94a3b8")
    status_label.pack(side=tk.RIGHT)

    # 主分割視窗 (左側資料庫清單 2 : 右側展示設定 1 比例)
    paned = tk.PanedWindow(root, orient=tk.HORIZONTAL, bg="#334155", bd=0, sashwidth=5)
    paned.pack(fill=tk.BOTH, expand=True, padx=15, pady=5)

    left_frame = tk.Frame(paned, bg="#1e293b")
    paned.add(left_frame, minsize=500, width=760)

    right_frame = tk.Frame(paned, bg="#0f172a", padx=15, pady=10)
    paned.add(right_frame, minsize=260, width=380)

    # 動態維持 2:1 比例
    def on_paned_configure(event):
        if event.widget == paned:
            total_w = paned.winfo_width()
            if total_w > 300:
                sash_pos = int(total_w * 2 / 3)
                try:
                    paned.sash_place(0, sash_pos, 0)
                except Exception:
                    pass

    paned.bind("<Configure>", on_paned_configure)

    # ------------------------------------------
    # 左側：搜尋列 + 展開按鈕
    # ------------------------------------------
    search_frame = tk.Frame(left_frame, bg="#1e293b", pady=8, padx=10)
    search_frame.pack(fill=tk.X)

    search_lbl = tk.Label(search_frame, text="🔍 搜尋檔名：", font=('Microsoft JhengHei', 9, 'bold'), bg="#1e293b", fg="#38bdf8")
    search_lbl.pack(side=tk.LEFT)

    search_var = tk.StringVar()
    search_entry = tk.Entry(search_frame, textvariable=search_var, font=('Microsoft JhengHei', 10), bg="#0f172a", fg="#ffffff", insertbackground="white", relief=tk.SOLID, bd=1)
    search_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(4, 8), ipady=2)

    btn_clear = tk.Button(search_frame, text="✕ 清除", font=('Microsoft JhengHei', 8), bg="#334155", fg="#cbd5e1", relief=tk.FLAT, padx=8, pady=3)
    btn_clear.pack(side=tk.LEFT, padx=(0, 6))

    btn_expand_all = tk.Button(search_frame, text="全部展開", font=('Microsoft JhengHei', 8), bg="#334155", fg="#cbd5e1", relief=tk.FLAT, padx=8, pady=3)
    btn_expand_all.pack(side=tk.LEFT, padx=(0, 4))

    btn_collapse_all = tk.Button(search_frame, text="全部折疊", font=('Microsoft JhengHei', 8), bg="#334155", fg="#cbd5e1", relief=tk.FLAT, padx=8, pady=3)
    btn_collapse_all.pack(side=tk.LEFT)

    # ------------------------------------------
    # 左側：Treeview 資料夾結構與檔案列表
    # ------------------------------------------
    tree_container = tk.Frame(left_frame, bg="#1e293b")
    tree_container.pack(fill=tk.BOTH, expand=True)

    columns = ("status", "type", "raw")
    tree = ttk.Treeview(tree_container, columns=columns, show="tree headings", selectmode="browse")
    tree.heading("#0", text="資料夾結構 / 教材名稱")
    tree.heading("status", text="狀態")
    tree.heading("type", text="卷別")
    tree.heading("raw", text="原檔名關鍵字")

    tree.column("#0", width=330, minwidth=220)
    tree.column("status", width=55, minwidth=50, anchor=tk.CENTER)
    tree.column("type", width=95, minwidth=80, anchor=tk.CENTER)
    tree.column("raw", width=250, minwidth=150)

    tree.tag_configure("folder", font=('Microsoft JhengHei', 9, 'bold'), foreground="#38bdf8")
    tree.tag_configure("item", font=('Microsoft JhengHei', 9), foreground="#f1f5f9")

    tree_y_scroll = ttk.Scrollbar(tree_container, orient=tk.VERTICAL, command=tree.yview)
    tree_x_scroll = ttk.Scrollbar(tree_container, orient=tk.HORIZONTAL, command=tree.xview)
    tree.configure(yscrollcommand=tree_y_scroll.set, xscrollcommand=tree_x_scroll.set)

    tree.grid(row=0, column=0, sticky="nsew")
    tree_y_scroll.grid(row=0, column=1, sticky="ns")
    tree_x_scroll.grid(row=1, column=0, sticky="ew")

    tree_container.grid_rowconfigure(0, weight=1)
    tree_container.grid_columnconfigure(0, weight=1)

    # ------------------------------------------
    # 右側：教材展示設定 (2:1 比例之 1)
    # ------------------------------------------
    tk.Label(right_frame, text="教材展示設定 (可自訂)", font=('Microsoft JhengHei', 12, 'bold'), bg="#0f172a", fg="#f1f5f9").pack(anchor=tk.W, pady=(0, 10))

    tk.Label(right_frame, text="學生端顯示標題：", font=('Microsoft JhengHei', 9, 'bold'), bg="#0f172a", fg="#94a3b8").pack(anchor=tk.W)
    title_entry = tk.Entry(right_frame, font=('Microsoft JhengHei', 10), bg="#1e293b", fg="#ffffff", insertbackground="white")
    title_entry.pack(fill=tk.X, pady=(2, 12), ipady=3)

    tk.Label(right_frame, text="掛載目標章節：", font=('Microsoft JhengHei', 9, 'bold'), bg="#0f172a", fg="#94a3b8").pack(anchor=tk.W)
    chapter_combo = ttk.Combobox(right_frame, values=[opt['label'] for opt in CHAPTER_OPTIONS], state="readonly", font=('Microsoft JhengHei', 9))
    chapter_combo.pack(fill=tk.X, pady=(2, 12))

    tk.Label(right_frame, text="原始檔案配對詳情：", font=('Microsoft JhengHei', 9, 'bold'), bg="#0f172a", fg="#94a3b8").pack(anchor=tk.W)
    detail_text = tk.Text(right_frame, height=10, bg="#1e293b", fg="#cbd5e1", font=('Consolas', 9), relief=tk.FLAT, padx=6, pady=6)
    detail_text.pack(fill=tk.X, pady=(2, 12))

    tips_card = tk.Label(right_frame, text="💡 操作小秘訣：\n• 勾選教材：按空白鍵 Space 或點擊狀態欄\n• 點擊資料夾可整批勾選/取消子項目\n• 右側修改標題與章節後自動即時保存\n• 頂端搜尋欄支援檔名與章節即時過濾",
                         font=('Microsoft JhengHei', 8), bg="#1e293b", fg="#94a3b8", justify=tk.LEFT, anchor=tk.W, padx=8, pady=8)
    tips_card.pack(fill=tk.X)

    # ------------------------------------------
    # 資料管理與狀態
    # ------------------------------------------
    candidates_data = []
    selected_indices = set()
    currently_shown_indices = []

    def get_descendants(folder_id):
        leaves = []
        stack = [folder_id]
        while stack:
            curr = stack.pop()
            for child in tree.get_children(curr):
                if child.startswith("item_"):
                    leaves.append(child)
                else:
                    stack.append(child)
        return leaves

    def render_tree(filter_text=""):
        tree.delete(*tree.get_children())
        query = filter_text.strip().lower()
        currently_shown_indices.clear()

        if not query:
            indices_to_show = list(range(len(candidates_data)))
            is_searching = False
        else:
            indices_to_show = []
            for i, c in enumerate(candidates_data):
                terms = [
                    c.get('clean_title', ''),
                    c.get('base_key', ''),
                    c.get('path', ''),
                    c.get('matched_chapter', {}).get('label', ''),
                    c.get('matched_chapter', {}).get('chapter', ''),
                    (c.get('q') or {}).get('name', ''),
                    (c.get('a') or {}).get('name', ''),
                    (c.get('c') or {}).get('name', '')
                ]
                if any(query in term.lower() for term in terms if term):
                    indices_to_show.append(i)
            is_searching = True

        currently_shown_indices.extend(indices_to_show)

        # 計算各資料夾底下的可用教材數
        folder_counts = {}
        for i in indices_to_show:
            c = candidates_data[i]
            path = c.get('path', '')
            parts = [p for p in path.strip('/').split('/') if p]
            curr_p = ""
            for p in parts:
                curr_p = f"{curr_p}/{p}"
                folder_counts[curr_p] = folder_counts.get(curr_p, 0) + 1

        # 預先在頂層建立主要根目錄：國中 與 高中
        if not is_searching:
            for top_name in ['國中', '高中']:
                cnt = folder_counts.get(f"/{top_name}", 0)
                lbl = f"📁 {top_name} ({cnt})" if cnt > 0 else f"📁 {top_name}"
                tree.insert("", tk.END, iid=f"dir_/{top_name}", text=lbl, open=True, values=("", "", ""), tags=("folder",))

        # 遍歷項目並建立階層
        for i in indices_to_show:
            c = candidates_data[i]
            path = c.get('path', '')
            parts = [p for p in path.strip('/').split('/') if p]

            parent_iid = ""
            curr_path = ""
            for part in parts:
                curr_path = f"{curr_path}/{part}"
                dir_iid = f"dir_{curr_path}"
                if not tree.exists(dir_iid):
                    cnt = folder_counts.get(curr_path, 0)
                    folder_label = f"📁 {part} ({cnt})" if cnt > 0 else f"📁 {part}"
                    # 搜尋時全部展開；非搜尋時頂層國中高中展開
                    should_open = True if is_searching or curr_path in ['/國中', '/高中'] else False
                    tree.insert(parent_iid, tk.END, iid=dir_iid, text=folder_label, open=should_open, values=("", "", ""), tags=("folder",))
                parent_iid = dir_iid

            if c['type'] == 'pair':
                type_str = "雙卷(題+解)"
            elif c['type'] == 'combined':
                type_str = "題解合一"
            else:
                type_str = "單卷"

            status_str = "[ ✔ ]" if i in selected_indices else "[   ]"
            item_iid = f"item_{i}"

            # 散落在外面的檔案 (parent_iid == "") 直接掛在 Treeview 最外層根目錄（與國中、高中並列）
            tree.insert(parent_iid, tk.END, iid=item_iid, text=f"📄 {c['clean_title']}", values=(status_str, type_str, c['base_key']), tags=("item",))

        update_summary_status(is_searching, query, len(indices_to_show))

    def update_summary_status(is_searching=False, query="", filtered_count=0):
        total_items = len(candidates_data)
        sel_count = len(selected_indices)
        if is_searching:
            status_var.set(f"🔍 搜尋「{query}」：符合 {filtered_count} 筆教材 (總已勾選 {sel_count} 份)")
        else:
            status_var.set(f"✔ 共 {total_items} 組可用教材 (已勾選 {sel_count} 份)")
        selected_count_label.config(text=f"已選取：{sel_count} / 共 {total_items} 份")

    # 搜尋與展開折疊處理
    def on_search_change(*args):
        render_tree(search_var.get())

    search_var.trace_add("write", on_search_change)

    def do_clear_search():
        search_var.set("")
        search_entry.focus_set()

    btn_clear.config(command=do_clear_search)

    def do_expand_all():
        def recurse(parent):
            for child in tree.get_children(parent):
                if not child.startswith("item_"):
                    tree.item(child, open=True)
                    recurse(child)
        recurse("")

    def do_collapse_all():
        def recurse(parent):
            for child in tree.get_children(parent):
                if not child.startswith("item_"):
                    tree.item(child, open=False)
                    recurse(child)
        recurse("")

    btn_expand_all.config(command=do_expand_all)
    btn_collapse_all.config(command=do_collapse_all)

    # 項目選取與即時更新右側資訊
    def update_detail_view(event):
        selected_item = tree.focus()
        if not selected_item:
            return

        if selected_item.startswith("item_"):
            idx = int(selected_item[5:])
            c = candidates_data[idx]
            title_entry.config(state="normal")
            title_entry.delete(0, tk.END)
            title_entry.insert(0, c['clean_title'])

            ch_label = c['matched_chapter']['label']
            if ch_label in chapter_combo['values']:
                chapter_combo.set(ch_label)

            detail_text.delete("1.0", tk.END)
            if c['type'] == 'pair':
                detail_text.insert(tk.END, f"【成對雙卷】\n目錄: {c.get('path') or '/'}\n題目卷: {c['q']['name']}\n詳解卷: {c['a']['name']}")
            elif c['type'] == 'combined':
                detail_text.insert(tk.END, f"【題解合一卷】\n目錄: {c.get('path') or '/'}\n完整卷: {c['c']['name']}")
            else:
                q_name = (c.get('q') or c.get('c') or c.get('a') or {}).get('name', '未知檔名')
                detail_text.insert(tk.END, f"【單卷教材】\n目錄: {c.get('path') or '/'}\n檔案: {q_name}")
        else:
            # 點選資料夾節點
            leaves = get_descendants(selected_item)
            indices = [int(l[5:]) for l in leaves]
            folder_text = tree.item(selected_item, "text")
            detail_text.delete("1.0", tk.END)
            folder_sel = sum(1 for idx in indices if idx in selected_indices)
            detail_text.insert(tk.END, f"【資料夾】{folder_text}\n\n• 包含教材：{len(leaves)} 份\n• 目前已勾選：{folder_sel} 份\n\n提示：點擊狀態欄或按空白鍵 Space，可批次勾選/取消本資料夾內的所有教材！")

    tree.bind("<<TreeviewSelect>>", update_detail_view)

    # 勾選與切換邏輯
    def toggle_node(item_id):
        if not item_id:
            return
        if item_id.startswith("item_"):
            idx = int(item_id[5:])
            if idx in selected_indices:
                selected_indices.remove(idx)
                tree.set(item_id, "status", "[   ]")
            else:
                selected_indices.add(idx)
                tree.set(item_id, "status", "[ ✔ ]")
        else:
            # 整批切換資料夾
            leaves = get_descendants(item_id)
            indices = [int(l[5:]) for l in leaves]
            all_selected = bool(indices) and all(idx in selected_indices for idx in indices)
            for l, idx in zip(leaves, indices):
                if all_selected:
                    selected_indices.discard(idx)
                    tree.set(l, "status", "[   ]")
                else:
                    selected_indices.add(idx)
                    tree.set(l, "status", "[ ✔ ]")
        update_summary_status(bool(search_var.get()), search_var.get(), len(currently_shown_indices))

    def on_space_key(event):
        item = tree.focus()
        if item:
            toggle_node(item)
            return "break"

    def on_single_click(event):
        region = tree.identify_region(event.x, event.y)
        col = tree.identify_column(event.x)
        item = tree.identify_row(event.y)
        # 點擊在第 1 欄 (狀態欄) 立即切換勾選
        if region == "cell" and col == "#1" and item:
            toggle_node(item)

    def on_double_click(event):
        item = tree.identify_row(event.y)
        if item and item.startswith("item_"):
            toggle_node(item)

    tree.bind("<space>", on_space_key)
    tree.bind("<Button-1>", on_single_click, add="+")
    tree.bind("<Double-1>", on_double_click)

    # 右側編輯儲存
    def save_current_edit():
        selected_item = tree.focus()
        if not selected_item or not selected_item.startswith("item_"):
            return
        idx = int(selected_item[5:])
        new_title = title_entry.get().strip()
        ch_label = chapter_combo.get()
        if new_title:
            candidates_data[idx]['clean_title'] = new_title
            tree.item(selected_item, text=f"📄 {new_title}")
        for opt in CHAPTER_OPTIONS:
            if opt['label'] == ch_label:
                candidates_data[idx]['matched_chapter'] = opt
                break

    title_entry.bind("<KeyRelease>", lambda e: save_current_edit())
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
                    render_tree(search_var.get())
                    status_var.set(f"✔ 掃描完成！共發現 {len(candidates_data)} 組可用教材。【按空白鍵 Space】或【點擊狀態欄】即可切換勾選！")

                root.after(0, update_ui)
            except Exception as e:
                root.after(0, lambda: messagebox.showerror("掃描錯誤", str(e)))

        threading.Thread(target=worker, daemon=True).start()

    # 批次選取功能
    def select_all_shown():
        for idx in currently_shown_indices:
            selected_indices.add(idx)
            item_id = f"item_{idx}"
            if tree.exists(item_id):
                tree.set(item_id, "status", "[ ✔ ]")
        update_summary_status(bool(search_var.get()), search_var.get(), len(currently_shown_indices))

    def clear_all_selection():
        selected_indices.clear()
        for idx in currently_shown_indices:
            item_id = f"item_{idx}"
            if tree.exists(item_id):
                tree.set(item_id, "status", "[   ]")
        update_summary_status(bool(search_var.get()), search_var.get(), len(currently_shown_indices))

    # Git 自動提交與推送
    def sync_to_git(count):
        """執行 git add, commit, push 自動推送至 GitHub"""
        cmd_add = ['git', 'add', 'src/data/resources.ts']
        commit_msg = f"feat(resources): 發布雲端教材 (共 {count} 份)"
        cmd_commit = ['git', 'commit', '-m', commit_msg]
        cmd_push = ['git', 'push']

        p_add = subprocess.run(cmd_add, cwd=BASE_DIR, capture_output=True, text=True, encoding='utf-8', errors='replace')
        if p_add.returncode != 0:
            raise RuntimeError(f"git add 失敗：\n{p_add.stderr or p_add.stdout}")

        p_commit = subprocess.run(cmd_commit, cwd=BASE_DIR, capture_output=True, text=True, encoding='utf-8', errors='replace')
        out_commit = (p_commit.stdout + p_commit.stderr).lower()
        if p_commit.returncode != 0 and 'nothing to commit' not in out_commit and 'working tree clean' not in out_commit:
            raise RuntimeError(f"git commit 失敗：\n{p_commit.stderr or p_commit.stdout}")

        p_push = subprocess.run(cmd_push, cwd=BASE_DIR, capture_output=True, text=True, encoding='utf-8', errors='replace')
        if p_push.returncode != 0:
            raise RuntimeError(f"git push 失敗：\n{p_push.stderr or p_push.stdout}")

    # 執行一鍵發布
    def do_publish():
        save_current_edit()
        if not selected_indices:
            messagebox.showwarning("提示", "您尚未勾選任何要發布的教材！\n(請選取項目後「按空白鍵 Space」或「點擊狀態欄」進行勾選)")
            return

        to_publish = [candidates_data[i] for i in sorted(selected_indices)]
        will_git = auto_git_var.get()

        msg = f"即將把以下 {len(to_publish)} 份教材寫入 AhaZone：\n\n"
        for item in to_publish[:10]:
            msg += f"• 【{item['matched_chapter']['chapter']}】{item['clean_title']}\n"
        if len(to_publish) > 10:
            msg += f"...以及另外 {len(to_publish) - 10} 份教材\n"
        
        if will_git:
            msg += "\n※ 已勾選「同步推送至 GitHub (自動 Git Push)」，寫入完成後將自動推送並觸發雲端上線！"
        else:
            msg += "\n※ 未勾選自動 Git Push，寫入後僅在本地生效，需手動執行 git push 才能上線。"

        msg += "\n\n請問是否確定發布？"

        if messagebox.askyesno("確認發布", msg):
            btn_publish.config(state="disabled", text="正在發布中...")
            status_var.set("正在寫入教材至 resources.ts...")

            def publish_worker():
                try:
                    count = write_to_resources_ts(to_publish)
                    if will_git:
                        root.after(0, lambda: status_var.set("正在執行 Git Commit & Push 至 GitHub..."))
                        sync_to_git(count)
                        root.after(0, lambda: (
                            btn_publish.config(state="normal", text="一鍵寫入 AhaZone 教材庫"),
                            status_var.set(f"✔ 成功發布並 Push {count} 筆資源至 GitHub！"),
                            messagebox.showinfo("發布成功", f"成功寫入 {count} 筆資源至 resources.ts，並已同步 Push 至 GitHub！\n\n線上網站將在數分鐘內自動完成雲端部署。")
                        ))
                    else:
                        root.after(0, lambda: (
                            btn_publish.config(state="normal", text="一鍵寫入 AhaZone 教材庫"),
                            status_var.set(f"✔ 成功寫入 {count} 筆資源至 resources.ts！"),
                            messagebox.showinfo("寫入成功", f"成功寫入 {count} 筆資源至 resources.ts！\n\n(提示：未勾選自動 Push，請記得在終端機執行 git push 以部署到線上網站)")
                        ))
                except Exception as e:
                    root.after(0, lambda err=e: (
                        btn_publish.config(state="normal", text="一鍵寫入 AhaZone 教材庫"),
                        status_var.set(f"❌ 發布失敗：{err}"),
                        messagebox.showerror("發布過程發生錯誤", str(err))
                    ))

            threading.Thread(target=publish_worker, daemon=True).start()

    # ------------------------------------------
    # 下方按鈕控制列
    # ------------------------------------------
    bottom_frame = tk.Frame(root, bg="#0f172a", pady=12, padx=15)
    bottom_frame.pack(fill=tk.X)

    btn_scan = tk.Button(bottom_frame, text="重新掃描雲端", command=run_scan, font=('Microsoft JhengHei', 9, 'bold'), bg="#334155", fg="#ffffff", padx=12, pady=6, relief=tk.FLAT)
    btn_scan.pack(side=tk.LEFT)

    btn_select_all = tk.Button(bottom_frame, text="全選目前顯示項目", command=select_all_shown, font=('Microsoft JhengHei', 9), bg="#1e293b", fg="#38bdf8", padx=10, pady=6, relief=tk.FLAT)
    btn_select_all.pack(side=tk.LEFT, padx=(10, 5))

    btn_clear_sel = tk.Button(bottom_frame, text="全部取消勾選", command=clear_all_selection, font=('Microsoft JhengHei', 9), bg="#1e293b", fg="#94a3b8", padx=10, pady=6, relief=tk.FLAT)
    btn_clear_sel.pack(side=tk.LEFT, padx=5)

    selected_count_label = tk.Label(bottom_frame, text="已選取：0 份", font=('Microsoft JhengHei', 9), bg="#0f172a", fg="#94a3b8")
    selected_count_label.pack(side=tk.LEFT, padx=15)

    btn_publish = tk.Button(bottom_frame, text="一鍵寫入 AhaZone 教材庫", command=do_publish, font=('Microsoft JhengHei', 10, 'bold'), bg="#0284c7", fg="#ffffff", padx=18, pady=6, relief=tk.FLAT)
    btn_publish.pack(side=tk.RIGHT)

    # 默認勾選自動 Git Push
    auto_git_var = tk.BooleanVar(value=True)
    chk_git = tk.Checkbutton(
        bottom_frame,
        text="同步推送至 GitHub (自動 Git Push)",
        variable=auto_git_var,
        font=('Microsoft JhengHei', 9),
        bg="#0f172a",
        fg="#38bdf8",
        activebackground="#0f172a",
        activeforeground="#38bdf8",
        selectcolor="#1e293b",
        cursor="hand2"
    )
    chk_git.pack(side=tk.RIGHT, padx=12)

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
    for i, c in enumerate(candidates[:20]):
        if c['type'] == 'pair':
            t = "雙卷"
        elif c['type'] == 'combined':
            t = "合一"
        else:
            t = "單卷"
        path_str = c.get('path') or '/'
        print(f"[{i+1}] [{t}] [{path_str}] 【{c['matched_chapter']['label']}】{c['clean_title']}")
        if c['type'] == 'pair':
            print(f"     題目: {c['q']['name']}\n     詳解: {c['a']['name']}")
        elif c['type'] == 'combined':
            print(f"     完整: {c['c']['name']}")
        else:
            q_name = (c.get('q') or c.get('c') or c.get('a') or {}).get('name', '')
            print(f"     單卷: {q_name}")

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--cli':
        run_cli()
    else:
        launch_gui()
