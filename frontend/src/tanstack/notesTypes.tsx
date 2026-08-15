export type ThisMonth = {
  month: number;
  year: number;
};

export type NoteType = {
  id: number;
  userID: number;
  date: number;
  note: string;
};

export type MonthOfNotes = NoteType[];
