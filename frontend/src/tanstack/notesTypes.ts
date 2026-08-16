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

export type WriteNoteType = {
  note: string;
  date: string;
};

export type NoteToUpdate = {
  noteID: number;
  noteContent: string;
};
