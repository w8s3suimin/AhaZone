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
              { name: '數與數線', semester: '7上', mathTrack: 'none' },
              { name: '標準分解式與分數運算', semester: '7上', mathTrack: 'none' },
              { name: '一元一次方程式', semester: '7上', mathTrack: 'none' }
            ]
          },
          {
            name: '七年級下學期 (第 2 冊)',
            chapters: [
              { name: '二元一次聯立方程式', semester: '7下', mathTrack: 'none' },
              { name: '直角坐標與二元一次方程式圖形', semester: '7下', mathTrack: 'none' },
              { name: '比例', semester: '7下', mathTrack: 'none' },
              { name: '一元一次不等式', semester: '7下', mathTrack: 'none' },
              { name: '統計圖表與統計數據', semester: '7下', mathTrack: 'none' },
              { name: '線對稱與三視圖', semester: '7下', mathTrack: 'none' }
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
              { name: '乘法公式', semester: '8上', mathTrack: 'none' },
              { name: '二次方根與畢氏定理', semester: '8上', mathTrack: 'none' },
              { name: '因式分解', semester: '8上', mathTrack: 'none' },
              { name: '一元二次方程式', semester: '8上', mathTrack: 'none' },
              { name: '統計資料處理', semester: '8上', mathTrack: 'none' }
            ]
          },
          {
            name: '八年級下學期 (第 4 冊)',
            chapters: [
              { name: '數列與級數', semester: '8下', mathTrack: 'none' },
              { name: '線型函數與其圖形', semester: '8下', mathTrack: 'none' },
              { name: '三角形的基本性質', semester: '8下', mathTrack: 'none' },
              { name: '平行與四邊形', semester: '8下', mathTrack: 'none' }
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
              { name: '相似形與三角比', semester: '9上', mathTrack: 'none' },
              { name: '圓形', semester: '9上', mathTrack: 'none' },
              { name: '推理證明與三角形的心', semester: '9上', mathTrack: 'none' }
            ]
          },
          {
            name: '九年級下學期 (第 6 冊)',
            chapters: [
              { name: '二次函數', semester: '9下', mathTrack: 'none' },
              { name: '統計與機率', semester: '9下', mathTrack: 'none' },
              { name: '立體圖形', semester: '9下', mathTrack: 'none' }
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
              { name: '生物體的組成與科學方法', semester: '7上', mathTrack: 'none' },
              { name: '養分', semester: '7上', mathTrack: 'none' },
              { name: '運輸與防禦', semester: '7上', mathTrack: 'none' },
              { name: '協調作用', semester: '7上', mathTrack: 'none' },
              { name: '恆定', semester: '7上', mathTrack: 'none' }
            ]
          },
          {
            name: '七年級下學期 (生物篇下)',
            chapters: [
              { name: '生殖', semester: '7下', mathTrack: 'none' },
              { name: '遺傳', semester: '7下', mathTrack: 'none' },
              { name: '演化與分類', semester: '7下', mathTrack: 'none' },
              { name: '生態系與環境保護', semester: '7下', mathTrack: 'none' }
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
              { name: '基本測量', semester: '8上', mathTrack: 'none' },
              { name: '物質的世界', semester: '8上', mathTrack: 'none' },
              { name: '波動與聲音', semester: '8上', mathTrack: 'none' },
              { name: '光、影像與顏色', semester: '8上', mathTrack: 'none' },
              { name: '溫度與熱', semester: '8上', mathTrack: 'none' },
              { name: '物質的基本結構', semester: '8上', mathTrack: 'none' }
            ]
          },
          {
            name: '八年級下學期 (理化篇下)',
            chapters: [
              { name: '化學反應', semester: '8下', mathTrack: 'none' },
              { name: '氧化還原反應', semester: '8下', mathTrack: 'none' },
              { name: '電解質與酸鹼鹽', semester: '8下', mathTrack: 'none' },
              { name: '反應速率與平衡', semester: '8下', mathTrack: 'none' },
              { name: '有機化合物', semester: '8下', mathTrack: 'none' },
              { name: '力與壓力', semester: '8下', mathTrack: 'none' }
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
              { name: '直線運動', semester: '9上', mathTrack: 'none' },
              { name: '力與運動', semester: '9上', mathTrack: 'none' },
              { name: '功與能', semester: '9上', mathTrack: 'none' },
              { name: '電流電壓與歐姆定律', semester: '9上', mathTrack: 'none' },
              { name: '地球的環境', semester: '9上', mathTrack: 'none' },
              { name: '板塊運動與岩層的秘密', semester: '9上', mathTrack: 'none' },
              { name: '浩瀚的宇宙', semester: '9上', mathTrack: 'none' }
            ]
          },
          {
            name: '九年級下學期 (電磁與地科下)',
            chapters: [
              { name: '電與生活', semester: '9下', mathTrack: 'none' },
              { name: '電與磁', semester: '9下', mathTrack: 'none' },
              { name: '變化莫測的天氣', semester: '9下', mathTrack: 'none' },
              { name: '永續的地球', semester: '9下', mathTrack: 'none' }
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
              { name: '數與式', semester: '10上', mathTrack: 'none' },
              { name: '直線與圓', semester: '10上', mathTrack: 'none' },
              { name: '多項式', semester: '10上', mathTrack: 'none' }
            ]
          },
          {
            name: '高一下學期 (第 2 冊 共同)',
            chapters: [
              { name: '數列級數', semester: '10下', mathTrack: 'none' },
              { name: '數據分析', semester: '10下', mathTrack: 'none' },
              { name: '排列組合與古典機率', semester: '10下', mathTrack: 'none' },
              { name: '三角比的定義及其性質', semester: '10下', mathTrack: 'none' }
            ]
          }
        ]
      },
      {
        gradeId: 's11-math',
        gradeName: '高中二年級 (高二)',
        semesters: [
          {
            name: '高二上學期 (第 3 冊進度)',
            chapters: [
              { name: '三角函數', semester: '11上', mathTrack: 'none' },
              { name: '指數函數與對數函數', semester: '11上', mathTrack: 'none' },
              { name: '平面向量', semester: '11上', mathTrack: 'none' }
            ]
          },
          {
            name: '高二下學期 (第 4 冊進度)',
            chapters: [
              { name: '空間概念與空間坐標', semester: '11下', mathTrack: 'none' },
              { name: '條件機率', semester: '11下', mathTrack: 'none' },
              { name: '矩陣運算及其應用', semester: '11下', mathTrack: 'none' }
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
              { name: '二次曲線 (拋物線、橢圓、雙曲線)', semester: '12下', mathTrack: 'mathA', tagLabel: '[數甲專屬]' },
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
            name: '高一上學期',
            chapters: [
              { name: '科學態度與物理量單位', semester: '10上', mathTrack: 'none' },
              { name: '物質的組成與交互作用', semester: '10上', mathTrack: 'none' },
              { name: '物體的運動', semester: '10上', mathTrack: 'none' }
            ]
          },
          {
            name: '高一下學期',
            chapters: [
              { name: '電與磁的統一', semester: '10下', mathTrack: 'none' },
              { name: '能量', semester: '10下', mathTrack: 'none' },
              { name: '量子現象', semester: '10下', mathTrack: 'none' }
            ]
          }
        ]
      },
      {
        gradeId: 's11-phy',
        gradeName: '高中二年級 (高二選修物理 I & II)',
        semesters: [
          {
            name: '高二上學期 (選修物理 I 力學)',
            chapters: [
              { name: '測量與不確定度', semester: '11上', mathTrack: 'none' },
              { name: '直線運動', semester: '11上', mathTrack: 'none' },
              { name: '平面運動', semester: '11上', mathTrack: 'none' },
              { name: '牛頓運動定律', semester: '11上', mathTrack: 'none', tagLabel: '[含圓周、SHM]' },
              { name: '萬有引力定律', semester: '11上', mathTrack: 'none' }
            ]
          },
          {
            name: '高二下學期 (選修物理 II 力學與熱學)',
            chapters: [
              { name: '動量守恆與碰撞 (彈性/非彈性碰撞)', semester: '11下', mathTrack: 'none' },
              { name: '力矩與角動量守恆', semester: '11下', mathTrack: 'none' },
              { name: '功與能量', semester: '11下', mathTrack: 'none' },
              { name: '熱學', semester: '11下', mathTrack: 'none' }
            ]
          }
        ]
      },
      {
        gradeId: 's12-phy',
        gradeName: '高中三年級 (高三選修物理 III ~ V)',
        semesters: [
          {
            name: '高三上學期 (選修物理 III 波動)',
            chapters: [
              { name: '波動', semester: '12上', mathTrack: 'none' },
              { name: '聲波', semester: '12上', mathTrack: 'none' },
              { name: '幾何光學 (折射定律、薄透鏡成像)', semester: '12上', mathTrack: 'none' },
              { name: '光的干涉與繞射', semester: '12上', mathTrack: 'none' }
            ]
          },
          {
            name: '高三下學期 (選修物理 IV~V 電磁學與近代物理)',
            chapters: [
              { name: '靜電學', semester: '12下', mathTrack: 'none', tagLabel: '[電位差、高斯定律]' },
              { name: '電流與電路', semester: '12下', mathTrack: 'none', tagLabel: '[克希荷夫、RC電路]' },
              { name: '電流的磁效應', semester: '12下', mathTrack: 'none' },
              { name: '電磁感應', semester: '12下', mathTrack: 'none' },
              { name: '近代物理的重大發現', semester: '12下', mathTrack: 'none', tagLabel: '[波粒二象性]' },
              { name: '原子結構與原子核', semester: '12下', mathTrack: 'none', tagLabel: '[氫原子模型]' }
            ]
          }
        ]
      }
    ]
  }
];
