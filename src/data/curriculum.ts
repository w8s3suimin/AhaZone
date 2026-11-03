export interface ChapterItem {
  name: string;
  semester: string; // e.g. '一上', '一下', '二上', '二下', '三上', '三下'
  mathTrack?: 'mathA' | 'mathB' | 'common' | 'none';
  tagLabel?: string;
}

export interface SubjectCurriculum {
  id: 'math' | 'physics' | 'science';
  name: string;
  stage: 'junior' | 'senior';
  grades: {
    gradeId: string;
    gradeName: string;
    semesters: {
      name: string; // e.g. '七年級上學期 (國一上)'
      chapters: ChapterItem[];
    }[];
  }[];
}

// 嚴格依據教育部 108 課綱最新標準教學進度與冊別排序
export const CURRICULUM_DATA: SubjectCurriculum[] = [
  // ==========================================
  // 1. 國中數學 (7上 ~ 9下 完整冊別)
  // ==========================================
  {
    id: 'math',
    name: '國中數學',
    stage: 'junior',
    grades: [
      {
        gradeId: 'j7',
        gradeName: '國中七年級 (國一)',
        semesters: [
          {
            name: '七年級上學期 (第 1 冊)',
            chapters: [
              { name: '整數的運算與數線', semester: '7上', mathTrack: 'none' },
              { name: '因數分解與標準分解式', semester: '7上', mathTrack: 'none' },
              { name: '分數的四則運算', semester: '7上', mathTrack: 'none' },
              { name: '一元一次方程式與生活應用', semester: '7上', mathTrack: 'none' }
            ]
          },
          {
            name: '七年級下學期 (第 2 冊)',
            chapters: [
              { name: '二元一次聯立方程式', semester: '7下', mathTrack: 'none' },
              { name: '平面直角坐標與二元一次圖形', semester: '7下', mathTrack: 'none' },
              { name: '比與比例式 (連比與正反比)', semester: '7下', mathTrack: 'none' },
              { name: '一元一次不等式', semester: '7下', mathTrack: 'none' }
            ]
          }
        ]
      },
      {
        gradeId: 'j8',
        gradeName: '國中八年級 (國二)',
        semesters: [
          {
            name: '八年級上學期 (第 3 冊)',
            chapters: [
              { name: '乘法公式與多項式運算', semester: '8上', mathTrack: 'none' },
              { name: '二次方根與畢氏定理', semester: '8上', mathTrack: 'none' },
              { name: '因式分解 (十字交乘法)', semester: '8上', mathTrack: 'none' },
              { name: '一元二次方程式解法與應用', semester: '8上', mathTrack: 'none' }
            ]
          },
          {
            name: '八年級下學期 (第 4 冊)',
            chapters: [
              { name: '等差數列與等差級數', semester: '8下', mathTrack: 'none' },
              { name: '幾何圖形與尺規作圖', semester: '8下', mathTrack: 'none' },
              { name: '三角形全等性質與角平分線', semester: '8下', mathTrack: 'none' },
              { name: '平行線與四邊形性質', semester: '8下', mathTrack: 'none' }
            ]
          }
        ]
      },
      {
        gradeId: 'j9',
        gradeName: '國中九年級 (國三)',
        semesters: [
          {
            name: '九年級上學期 (第 5 冊)',
            chapters: [
              { name: '相似形與截比例線段', semester: '9上', mathTrack: 'none' },
              { name: '圓形 (圓心角、圓周角、切線)', semester: '9上', mathTrack: 'none' },
              { name: '幾何推理與三角形三心 (外心、內心、重心)', semester: '9上', mathTrack: 'none' }
            ]
          },
          {
            name: '九年級下學期 (第 6 冊)',
            chapters: [
              { name: '二次函數與極值應用', semester: '9下', mathTrack: 'none' },
              { name: '統計圖表、四分位數與盒狀圖', semester: '9下', mathTrack: 'none' },
              { name: '機率與抽樣統計', semester: '9下', mathTrack: 'none' },
              { name: '立體幾何圖形與三視圖', semester: '9下', mathTrack: 'none' }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // 2. 國中自然 (生物 / 理化 / 地科)
  // ==========================================
  {
    id: 'science',
    name: '國中自然',
    stage: 'junior',
    grades: [
      {
        gradeId: 'j7-sci',
        gradeName: '國中七年級 (國一生物)',
        semesters: [
          {
            name: '七年級上學期 (生物篇上)',
            chapters: [
              { name: '生命現象與細胞構造', semester: '7上', mathTrack: 'none' },
              { name: '生物體的組成層次與養分', semester: '7上', mathTrack: 'none' },
              { name: '生物體內部的運輸與消化循環', semester: '7上', mathTrack: 'none' },
              { name: '生物體的協調與恆定性 (排泄與調節)', semester: '7上', mathTrack: 'none' }
            ]
          },
          {
            name: '七年級下學期 (生物篇下)',
            chapters: [
              { name: '生殖作用與遺傳法則', semester: '7下', mathTrack: 'none' },
              { name: '演化學說與生物多樣性', semester: '7下', mathTrack: 'none' },
              { name: '生態系平衡與環境保護', semester: '7下', mathTrack: 'none' }
            ]
          }
        ]
      },
      {
        gradeId: 'j8-sci',
        gradeName: '國中八年級 (國二理化)',
        semesters: [
          {
            name: '八年級上學期 (理化篇上)',
            chapters: [
              { name: '基本測量與密度', semester: '8上', mathTrack: 'none' },
              { name: '物質的世界 (純物質與混合物)', semester: '8上', mathTrack: 'none' },
              { name: '波動與聲音的傳播', semester: '8上', mathTrack: 'none' },
              { name: '光學 (光的反射、折射與面鏡透鏡成像)', semester: '8上', mathTrack: 'none' },
              { name: '溫度與熱量 (比熱與熱傳播)', semester: '8上', mathTrack: 'none' }
            ]
          },
          {
            name: '八年級下學期 (理化篇下)',
            chapters: [
              { name: '化學反應與質量守恆定律', semester: '8下', mathTrack: 'none' },
              { name: '反應速率與化學平衡', semester: '8下', mathTrack: 'none' },
              { name: '酸鹼鹽溶液與氧化還原', semester: '8下', mathTrack: 'none' },
              { name: '有機化合物與生活化學', semester: '8下', mathTrack: 'none' },
              { name: '常見的力與壓力、浮力', semester: '8下', mathTrack: 'none' }
            ]
          }
        ]
      },
      {
        gradeId: 'j9-sci',
        gradeName: '國中九年級 (國三理化與地科)',
        semesters: [
          {
            name: '九年級上學期 (力學與地科上)',
            chapters: [
              { name: '直線運動 (速度、加速度與 v-t 圖)', semester: '9上', mathTrack: 'none' },
              { name: '牛頓運動定律與萬有引力', semester: '9上', mathTrack: 'none' },
              { name: '功與力學能守恆', semester: '9上', mathTrack: 'none' },
              { name: '靜電與歐姆定律 (基本電路)', semester: '9上', mathTrack: 'none' },
              { name: '地球構造與板塊構造學說', semester: '9上', mathTrack: 'none' }
            ]
          },
          {
            name: '九年級下學期 (電磁與地科下)',
            chapters: [
              { name: '電流的熱效應與化學效應', semester: '9下', mathTrack: 'none' },
              { name: '電流的磁效應與電磁感應', semester: '9下', mathTrack: 'none' },
              { name: '天氣變化、大氣與海洋', semester: '9下', mathTrack: 'none' },
              { name: '天文宇宙與地球環境變遷', semester: '9下', mathTrack: 'none' }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // 3. 高中數學 (高一必修 ~ 高二數A/B ~ 高三數甲/乙)
  // ==========================================
  {
    id: 'math',
    name: '高中數學',
    stage: 'senior',
    grades: [
      {
        gradeId: 's10-math',
        gradeName: '高中一年級 (高一必修)',
        semesters: [
          {
            name: '高一上學期 (第 1 冊 共同)',
            chapters: [
              { name: '實數與絕對值不等式', semester: '10上', mathTrack: 'common', tagLabel: '[數A+B]' },
              { name: '直線方程式與圓的幾何', semester: '10上', mathTrack: 'common', tagLabel: '[數A+B]' },
              { name: '多項式函數 (除法原理、餘式定理)', semester: '10上', mathTrack: 'common', tagLabel: '[數A+B]' }
            ]
          },
          {
            name: '高一下學期 (第 2 冊 共同)',
            chapters: [
              { name: '數列與級數 (等差、等比、sigma運算)', semester: '10下', mathTrack: 'common', tagLabel: '[數A+B]' },
              { name: '數據分析 (一維數據與二維相關係數)', semester: '10下', mathTrack: 'common', tagLabel: '[數A+B]' },
              { name: '古典機率與排列組合導論', semester: '10下', mathTrack: 'common', tagLabel: '[數A+B]' },
              { name: '廣義角與三角比', semester: '10下', mathTrack: 'common', tagLabel: '[數A+B]' },
              { name: '正弦定理、餘弦定理與三角測量', semester: '10下', mathTrack: 'common', tagLabel: '[數A+B]' }
            ]
          }
        ]
      },
      {
        gradeId: 's11-math',
        gradeName: '高中二年級 (高二 "數A/數甲" & "數B/數乙" 兩種分流)',
        semesters: [
          {
            name: '高二上學期 (第 3 冊進度)',
            chapters: [
              // 數A
              { name: '三角函數圖形與正餘弦疊合', semester: '11上', mathTrack: 'common', tagLabel: '[數A+B]' },
              { name: '差角公式與倍半角公式', semester: '11上', mathTrack: 'mathA', tagLabel: '[數A專屬]' },
              { name: '指數與對數函數圖形與運算', semester: '11上', mathTrack: 'common', tagLabel: '[數A+B]' },
              { name: '平面向量的運算與內積', semester: '11上', mathTrack: 'common', tagLabel: '[數A+B]' },
              { name: '向量柯西不等式與正射影', semester: '11上', mathTrack: 'mathA', tagLabel: '[數A專屬]' },
              { name: '二階行列式與平面面積', semester: '11上', mathTrack: 'common', tagLabel: '[數A+B]' }
            ]
          },
          {
            name: '高二下學期 (第 4 冊進度)',
            chapters: [
              // 數A+B 共同
              { name: '空間概念與空間坐標系', semester: '11下', mathTrack: 'common', tagLabel: '[數A+B]' },
              { name: '條件機率與貝氏定理', semester: '11下', mathTrack: 'common', tagLabel: '[數A+B]' },
              { name: '矩陣運算與二階轉移矩陣', semester: '11下', mathTrack: 'common', tagLabel: '[數A+B]' },

              // 數A 專屬
              { name: '空間向量與三維平面方程式', semester: '11下', mathTrack: 'mathA', tagLabel: '[數A專屬]' },
              { name: '空間向量外積與三階行列式體積', semester: '11下', mathTrack: 'mathA', tagLabel: '[數A專屬]' },
              { name: '平面線性變換與旋轉矩陣', semester: '11下', mathTrack: 'mathA', tagLabel: '[數A專屬]' },
              { name: '圓錐截面與二次曲線 (拋物線、橢圓、雙曲線)', semester: '11下', mathTrack: 'mathA', tagLabel: '[數A專屬]' },
              { name: '雙圓錐截面立體幾何與漸近線對偶', semester: '11下', mathTrack: 'mathA', tagLabel: '[數A專屬]' },

              // 數B 專屬
              { name: '單點透視圖與立體視圖繪製', semester: '11下', mathTrack: 'mathB', tagLabel: '[數B專屬]' },
              { name: '球面經緯度坐標與大圓航線', semester: '11下', mathTrack: 'mathB', tagLabel: '[數B專屬]' },
              { name: '圓錐截面幾何特性與日晷模型', semester: '11下', mathTrack: 'mathB', tagLabel: '[數B專屬]' }
            ]
          }
        ]
      },
      {
        gradeId: 's12-math',
        gradeName: '高中三年級 (高三 數甲 / 數乙 / 分科測驗)',
        semesters: [
          {
            name: '高三上學期 (微積分導論與機率)',
            chapters: [
              { name: '極限與連續函數 (夾擠定理)', semester: '12上', mathTrack: 'mathA', tagLabel: '[數甲專屬]' },
              { name: '多項式導函數與切線斜率', semester: '12上', mathTrack: 'common', tagLabel: '[數甲+乙]' },
              { name: '函數極值、單調性與反曲點', semester: '12上', mathTrack: 'mathA', tagLabel: '[數甲專屬]' },
              { name: '定積分與旋轉體體積應用', semester: '12上', mathTrack: 'mathA', tagLabel: '[數甲專屬]' },
              { name: '多項式函數導數與生活最適化', semester: '12上', mathTrack: 'mathB', tagLabel: '[數乙專屬]' },
              { name: '離散隨機變數與二項分布', semester: '12上', mathTrack: 'common', tagLabel: '[數甲+乙]' }
            ]
          },
          {
            name: '高三下學期 (分科進階幾何與整合)',
            chapters: [
              { name: '空間直線方程式與對稱比例式', semester: '12下', mathTrack: 'mathA', tagLabel: '[數甲專屬]' },
              { name: '空間歪斜線距離與法向量應用', semester: '12下', mathTrack: 'mathA', tagLabel: '[數甲專屬]' },
              { name: '學測與分科測驗跨冊整合總複習', semester: '12下', mathTrack: 'common', tagLabel: '[數A+B]' }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // 4. 高中物理 (高一必修 ~ 選修物理 I~V)
  // ==========================================
  {
    id: 'physics',
    name: '高中物理',
    stage: 'senior',
    grades: [
      {
        gradeId: 's10-phy',
        gradeName: '高中一年級 (高一必修物理)',
        semesters: [
          {
            name: '高一全學年進度',
            chapters: [
              { name: '科學態度與物理量單位', semester: '10全', mathTrack: 'none' },
              { name: '物質的組成與原子結構', semester: '10全', mathTrack: 'none' },
              { name: '物體的運動與牛頓力學', semester: '10全', mathTrack: 'none' },
              { name: '自然界的四大基本交互作用力', semester: '10全', mathTrack: 'none' },
              { name: '電與磁的統一與光電效應導論', semester: '10全', mathTrack: 'none' },
              { name: '能量的形式與守恆定律', semester: '10全', mathTrack: 'none' }
            ]
          }
        ]
      },
      {
        gradeId: 's11-phy',
        gradeName: '高中二年級 (高二選修物理 I & II)',
        semesters: [
          {
            name: '高二上學期 (選修物理 I 力學進階)',
            chapters: [
              { name: '直線運動 (v-t 圖、等加速度公式解析)', semester: '11上', mathTrack: 'none' },
              { name: '平面運動 (向量分解、水平拋體、斜向拋體)', semester: '11上', mathTrack: 'none' },
              { name: '牛頓運動定律與力學平衡', semester: '11上', mathTrack: 'none' }
            ]
          },
          {
            name: '高二下學期 (選修物理 II 運動與能量)',
            chapters: [
              { name: '等速率圓周運動與向心加速度', semester: '11下', mathTrack: 'none' },
              { name: '萬有引力定律與人造衛星軌道', semester: '11下', mathTrack: 'none' },
              { name: '動量守恆與碰撞 (彈性/非彈性碰撞)', semester: '11下', mathTrack: 'none' },
              { name: '功與位能、力學能守恆', semester: '11下', mathTrack: 'none' }
            ]
          }
        ]
      },
      {
        gradeId: 's12-phy',
        gradeName: '高中三年級 (高三選修物理 III ~ V)',
        semesters: [
          {
            name: '高三上學期 (波動、熱學與電磁學)',
            chapters: [
              { name: '簡諧運動 (SHM) 與彈簧單擺', semester: '12上', mathTrack: 'none' },
              { name: '力矩與角動量守恆', semester: '12上', mathTrack: 'none' },
              { name: '波動現象與聲波駐波、都卜勒效應', semester: '12上', mathTrack: 'none' },
              { name: '幾何光學 (折射定律、薄透鏡成像)', semester: '12上', mathTrack: 'none' },
              { name: '靜電學與電位差、高斯定律', semester: '12上', mathTrack: 'none' }
            ]
          },
          {
            name: '高三下學期 (電磁學與近代物理)',
            chapters: [
              { name: '電路學、克希荷夫定律與RC電路', semester: '12下', mathTrack: 'none' },
              { name: '磁場與安培力、載流導線受力', semester: '12下', mathTrack: 'none' },
              { name: '法拉第電磁感應與冷次定律', semester: '12下', mathTrack: 'none' },
              { name: '近代物理 (波粒二象性、氫原子模型)', semester: '12下', mathTrack: 'none' }
            ]
          }
        ]
      }
    ]
  }
];
