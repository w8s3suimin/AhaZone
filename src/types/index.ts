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

export interface ResourceItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  type: 'dynamic' | 'pdf-exam' | 'pdf-lecture';
  stage: 'junior' | 'senior';
  grade: string;
  gradeLabel: string;
  subject: 'math' | 'physics' | 'science';
  subjectLabel: string;
  chapter: string;
  tags: string[];
  filePath: string;
  answerPath?: string;
  ahaInsight: string; // 悟境亮點 / 思考點撥
  learningGoals?: string[];
  featured?: boolean;
  date: string;
  downloads?: number;
  rating?: number;
}
