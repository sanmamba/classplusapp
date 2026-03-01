export interface Option {
  _id: string;
  name?: string | number; // HTML content - can be number in JSON
  nameText: string | number; // Text content - required in JSON
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
  type: 'multiple_choice' | 'integer' | string; // Allow string to match JSON data
  options: Option[];
  solution?: string; // HTML content
  fillUpsAnswers?: (string | number)[];
  marks: QuestionMarks;
  timeTaken: number; // in milliseconds
  isAttempted: boolean;
  isCorrect: boolean;
  isGraceMarked: boolean;
  isReevaluated: boolean;
  isPartiallyCorrect: boolean;
  markForReview: boolean;
  sectionId: string;
  order: number;
  questionSubmitOrder: number;
  isComprehension?: boolean;
  paragraph?: any;
  paragraphText?: any;
  hasMultipleAnswers?: boolean;
  isGpscType?: boolean;
  isSurrendered?: boolean;
  difficultyLevel?: any;
}

export interface Section {
  _id: string;
  name: string;
  sectionMarks: number;
  sectionDuration?: number;
  isActive: boolean;
  draftMode?: boolean;
  sectionInstructions?: string;
  hasOptionalQuestions?: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
  questions: Question[];
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