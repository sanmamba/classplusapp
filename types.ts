export interface Option {
  _id: string;
  name: string; // HTML content
  nameText?: string | number;
  isCorrect: boolean;
  isMarked: boolean;
  solution?: string | number;
}

export interface QuestionMarks {
  positive: number;
  negative: number;
}

export interface Question {
  _id: string;
  name: string; // HTML content
  nameText?: string;
  type: 'multiple_choice' | 'integer';
  options: Option[];
  solution?: string; // HTML content
  fillUpsAnswers?: (string | number)[];
  marks: QuestionMarks;
  timeTaken: number; // in milliseconds
  isAttempted: boolean;
  isCorrect: boolean;
  isPartiallyCorrect: boolean;
  markForReview: boolean;
  sectionId: string;
  order: number;
  questionSubmitOrder: number;
}

export interface Section {
  _id: string;
  name: string;
  sectionMarks: number;
  questions: Question[];
  order: number;
  isActive: boolean;
}

export interface SectionStats {
  _id: string;
  sectionId: string;
  name: string;
  marksScored: number;
  sectionMarks: number;
  totalQuestions: number;
  correctAnswers: number;
  inCorrectAnswers: number;
  partiallyCorrectAnswers: number;
  unAttempted: number;
  accuracy: number;
}

export interface TestData {
  data: {
    test: {
      name: string;
      testTotalDuration: number;
    };
    sections: Section[];
    sectionWiseStats?: SectionStats[];
    userDetails?: {
      name: string;
    };
  };
}

export interface TestMetadata {
  id: string;
  name: string;
  fileName: string;
}