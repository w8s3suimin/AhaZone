export interface ChapterItem {
  name: string;
  mathTrack?: 'mathA' | 'mathB' | 'common' | 'none'; // 數A / 數B / 數A+B共同
  tagLabel?: string; // '[數A]', '[數B]', '[數A+B]'
}

export interface SubjectNode {
  id: 'math' | 'physics' | 'science';
  name: string;
  chapters: ChapterItem[];
}

export interface GradeNode {
  id: string;
  name: string;
  stage: 'junior' | 'senior';
  subjects: SubjectNode[];
}

export const TAIWAN_108_CURRICULUM: GradeNode[] = [
  // ================= 國中階段 =================
  {
    id: 'junior-7',
    name: '國中七年級 (國一)',
    stage: 'junior',
    subjects: [
      {
        id: 'math',
        name: '國一數學',
        chapters: [
          { name: '整數運算與負數', mathTrack: 'none' },
          { name: '分數運算與標準分解式', mathTrack: 'none' },
          { name: '一元一次方程式', mathTrack: 'none' },
          { name: '二元一次聯立方程式', mathTrack: 'none' },
          { name: '直角坐標與二元一次方程式圖形', mathTrack: 'none' },
          { name: '比例式與生活應用', mathTrack: 'none' },
          { name: '一元一次不等式', mathTrack: 'none' }
        ]
      },
      {
        id: 'science',
        name: '國一自然 (生物)',
        chapters: [
          { name: '細胞與生物體組成', mathTrack: 'none' },
          { name: '養分與人體的消化循環', mathTrack: 'none' },
          { name: '呼吸與排泄調節', mathTrack: 'none' },
          { name: '生殖與遺傳', mathTrack: 'none' },
          { name: '演化與生態系', mathTrack: 'none' }
        ]
      }
    ]
  },
  {
    id: 'junior-8',
    name: '國中八年級 (國二)',
    stage: 'junior',
    subjects: [
      {
        id: 'math',
        name: '國二數學',
        chapters: [
          { name: '乘法公式與多項式運算', mathTrack: 'none' },
          { name: '二次方根與畢氏定理', mathTrack: 'none' },
          { name: '因式分解 (提公因式、十字交乘)', mathTrack: 'none' },
          { name: '一元二次方程式解法與應用', mathTrack: 'none' },
          { name: '等差數列與等差級數', mathTrack: 'none' },
          { name: '幾何圖形與尺規作圖', mathTrack: 'none' },
          { name: '三角形全等性質與角平分線', mathTrack: 'none' },
          { name: '平行線與四邊形', mathTrack: 'none' }
        ]
      },
      {
        id: 'science',
        name: '國二自然 (理化)',
        chapters: [
          { name: '基本測量與密度', mathTrack: 'none' },
          { name: '物質的組成與反應', mathTrack: 'none' },
          { name: '光學與聲音波動', mathTrack: 'none' },
          { name: '溫度與熱能傳播', mathTrack: 'none' },
          { name: '力與壓力、浮力', mathTrack: 'none' },
          { name: '酸鹼鹽與氧化還原', mathTrack: 'none' }
        ]
      }
    ]
  },
  {
    id: 'junior-9',
    name: '國中九年級 (國三)',
    stage: 'junior',
    subjects: [
      {
        id: 'math',
        name: '國三數學',
        chapters: [
          { name: '相似形與截比例線段', mathTrack: 'none' },
          { name: '圓形 (圓心角、圓周角、切線性質)', mathTrack: 'none' },
          { name: '幾何推理與三角形三心 (外心、內心、重心)', mathTrack: 'none' },
          { name: '二次函數與極值應用', mathTrack: 'none' },
          { name: '統計圖表與盒狀圖', mathTrack: 'none' },
          { name: '機率與抽樣統計', mathTrack: 'none' },
          { name: '空間幾何圖形與三視圖', mathTrack: 'none' }
        ]
      },
      {
        id: 'science',
        name: '國三自然 (理化/地科)',
        chapters: [
          { name: '直線運動 (速度與加速度)', mathTrack: 'none' },
          { name: '牛頓運動定律與萬有引力', mathTrack: 'none' },
          { name: '功與動能、位能', mathTrack: 'none' },
          { name: '基本電路與歐姆定律', mathTrack: 'none' },
          { name: '電流的磁效應與感應電流', mathTrack: 'none' },
          { name: '地球構造與板塊運動', mathTrack: 'none' },
          { name: '天氣變化與天文宇宙', mathTrack: 'none' }
        ]
      }
    ]
  },

  // ================= 高中階段 =================
  {
    id: 'senior-10',
    name: '高中一年級 (高一)',
    stage: 'senior',
    subjects: [
      {
        id: 'math',
        name: '高一數學 (共同)',
        chapters: [
          { name: '實數與絕對值不等式', mathTrack: 'common', tagLabel: '[數A+B]' },
          { name: '多項式函數 (除法原理、餘式定理)', mathTrack: 'common', tagLabel: '[數A+B]' },
          { name: '直線方程式與圓的幾何', mathTrack: 'common', tagLabel: '[數A+B]' },
          { name: '數列與級數 (等差、等比、sigma運算)', mathTrack: 'common', tagLabel: '[數A+B]' },
          { name: '指數與對數運算、函數圖形', mathTrack: 'common', tagLabel: '[數A+B]' },
          { name: '常用對數與科學記號首數尾數', mathTrack: 'common', tagLabel: '[數A+B]' },
          { name: '廣義角與三角比', mathTrack: 'common', tagLabel: '[數A+B]' },
          { name: '正弦定理、餘弦定理與三角測量', mathTrack: 'common', tagLabel: '[數A+B]' },
          { name: '單變量與雙變量數據分析', mathTrack: 'common', tagLabel: '[數A+B]' }
        ]
      },
      {
        id: 'physics',
        name: '高一物理',
        chapters: [
          { name: '科學態度與物理量單位', mathTrack: 'none' },
          { name: '物質的組成與原子結構', mathTrack: 'none' },
          { name: '物體的運動與牛頓力學', mathTrack: 'none' },
          { name: '自然界的四大基本交互作用力', mathTrack: 'none' },
          { name: '電與磁的統一與光電效應導論', mathTrack: 'none' },
          { name: '能量的形式與守恆定律', mathTrack: 'none' }
        ]
      }
    ]
  },
  {
    id: 'senior-11',
    name: '高中二年級 (高二)',
    stage: 'senior',
    subjects: [
      {
        id: 'math',
        name: '高二數學 (數A / 數B)',
        chapters: [
          // 數A/數B 共同章節
          { name: '三角函數圖形與正餘弦疊合', mathTrack: 'common', tagLabel: '[數A+B]' },
          { name: '平面向量的運算與內積', mathTrack: 'common', tagLabel: '[數A+B]' },
          { name: '面積與行列式應用', mathTrack: 'common', tagLabel: '[數A+B]' },
          { name: '空間概念與空間坐標系', mathTrack: 'common', tagLabel: '[數A+B]' },
          { name: '矩陣運算與二階轉移矩陣', mathTrack: 'common', tagLabel: '[數A+B]' },

          // 數A 專屬章節
          { name: '差角公式與倍半角公式', mathTrack: 'mathA', tagLabel: '[數A專屬]' },
          { name: '向量柯西不等式與正射影', mathTrack: 'mathA', tagLabel: '[數A專屬]' },
          { name: '空間向量與三維平面方程式', mathTrack: 'mathA', tagLabel: '[數A專屬]' },
          { name: '空間外積與三階行列式體積', mathTrack: 'mathA', tagLabel: '[數A專屬]' },
          { name: '平面線性變換與旋轉矩陣', mathTrack: 'mathA', tagLabel: '[數A專屬]' },
          { name: '圓錐截面與二次曲線 (拋物線、橢圓、雙曲線)', mathTrack: 'mathA', tagLabel: '[數A專屬]' },
          { name: '雙圓錐截面立體幾何與漸近線對偶', mathTrack: 'mathA', tagLabel: '[數A專屬]' },

          // 數B 專屬章節
          { name: '圓錐截面幾何特性與日晷模型', mathTrack: 'mathB', tagLabel: '[數B專屬]' },
          { name: '單點透視圖與立體視圖繪製', mathTrack: 'mathB', tagLabel: '[數B專屬]' },
          { name: '平面幾何坐標旋轉直觀', mathTrack: 'mathB', tagLabel: '[數B專屬]' },
          { name: '球面經緯度坐標與大圓航線', mathTrack: 'mathB', tagLabel: '[數B專屬]' }
        ]
      },
      {
        id: 'physics',
        name: '高二選修物理 I & II',
        chapters: [
          { name: '直線運動 (v-t 圖、等加速度公式解析)', mathTrack: 'none' },
          { name: '平面運動 (向量分解、水平拋體、斜向拋體)', mathTrack: 'none' },
          { name: '牛頓運動定律與力學平衡', mathTrack: 'none' },
          { name: '等速率圓周運動與向心加速度', mathTrack: 'none' },
          { name: '簡諧運動 (SHM) 與彈簧單擺', mathTrack: 'none' },
          { name: '萬有引力定律與人造衛星軌道', mathTrack: 'none' },
          { name: '動量守恆與碰撞 (彈性/非彈性碰撞)', mathTrack: 'none' },
          { name: '功與位能、力學能守恆', mathTrack: 'none' }
        ]
      }
    ]
  },
  {
    id: 'senior-12',
    name: '高中三年級 (高三)',
    stage: 'senior',
    subjects: [
      {
        id: 'math',
        name: '高三數學 (數甲 / 數乙)',
        chapters: [
          { name: '條件機率與貝氏定理', mathTrack: 'common', tagLabel: '[數甲+乙]' },
          { name: '離散隨機變數與二項分布', mathTrack: 'common', tagLabel: '[數甲+乙]' },
          { name: '極限與連續函數 (夾擠定理)', mathTrack: 'mathA', tagLabel: '[數甲專屬]' },
          { name: '導函數與切線斜率 (微積分導論)', mathTrack: 'mathA', tagLabel: '[數甲專屬]' },
          { name: '函數極值、單調性與反曲點', mathTrack: 'mathA', tagLabel: '[數甲專屬]' },
          { name: '定積分與旋轉體體積應用', mathTrack: 'mathA', tagLabel: '[數甲專屬]' },
          { name: '多項式函數導數與生活最適化', mathTrack: 'mathB', tagLabel: '[數乙專屬]' },
          { name: '空間直線方程式與對稱比例式', mathTrack: 'mathA', tagLabel: '[數甲專屬]' },
          { name: '空間歪斜線距離與法向量應用', mathTrack: 'mathA', tagLabel: '[數甲專屬]' }
        ]
      },
      {
        id: 'physics',
        name: '高三選修物理 III & IV & V',
        chapters: [
          { name: '力矩與角動量守恆', mathTrack: 'none' },
          { name: '波動現象與聲波駐波、都卜勒效應', mathTrack: 'none' },
          { name: '幾何光學 (折射定律、薄透鏡成像)', mathTrack: 'none' },
          { name: '靜電學與電位差、高斯定律', mathTrack: 'none' },
          { name: '電路學、克希荷夫定律與RC電路', mathTrack: 'none' },
          { name: '磁場與安培力、載流導線受力', mathTrack: 'none' },
          { name: '法拉第電磁感應與冷次定律', mathTrack: 'none' },
          { name: '近代物理 (波粒二象性、氫原子模型)', mathTrack: 'none' }
        ]
      }
    ]
  }
];
