export interface User {
  name: string;
  email: string;
  isGuest?: boolean;
}

export interface QuizHistory {
  id: number | string;
  language: string;
  score: number;
  totalQuestions: number;
  date: string;
}

export interface DictionaryHistory {
  id: number | string;
  word: string;
  language: string;
  date: string;
}

