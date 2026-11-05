export type EducationStage = 'all' | 'junior' | 'senior';

export type SubjectId = 'all' | 'math' | 'physics' | 'science';

export type ResourceType = 'all' | 'dynamic' | 'pdf-exam' | 'pdf-lecture';

export interface CurriculumChapter {
  id: string;
  name: string;
  description?: string;
  stage: 'junior' | 'senior';
  grade: string;
  subject: 'math' | 'physics' | 'science';
}

export interface OperationTip {
  title: string;
  desc: string;
  color?: 'sky' | 'amber' | 'emerald' | 'indigo' | string;
}

export interface ResourceItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  type: 'dynamic' | 'pdf-exam' | 'pdf-lecture';
  categoryLabel?: string; // 自訂分類標籤（如：動態出題練習卷、3D 幾何模擬室）
  actionLabel?: string;   // 自訂按鈕文字（如：開啟動態練習卷、啟動 3D 模擬室）
  stage: 'junior' | 'senior';
  grade: string;
  gradeLabel: string;
  subject: 'math' | 'physics' | 'science';
  subjectLabel: string;
  chapter: string;
  tags: string[];
  filePath: string;
  answerPath?: string;
  ahaInsight?: string; // 訣竅引導 / 頓悟點
  learningGoals?: string[];
  operationTips?: OperationTip[]; // 互動操作導引項目
  featured?: boolean;
  date: string;
  downloads?: number;
  rating?: number;
}
