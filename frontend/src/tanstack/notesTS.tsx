import { queryOptions, mutationOptions } from "@tanstack/react-query";
import type {
  ThisMonth,
  NoteType,
  MonthOfNotes,
  WriteNoteType,
} from "./notesTypes";

export const getNotesByMonthQuery = (
  thisMonth: ThisMonth,
  accessToken: string,
) => {
  return queryOptions({
    queryKey: ["userNotes", thisMonth],
    queryFn: () => getNotesThisMonth(thisMonth, accessToken),
  });
};

export const writeANoteMut = () => {
  return mutationOptions({
    mutationFn: writeANote,
  });
};

export const updateNoteMut = () => {
  return mutationOptions({
    mutationFn: updateANote,
  });
};

// --------- API CALLS --------- \\

async function getNotesThisMonth(
  thisMonth: ThisMonth,
  accessToken: string,
): Promise<MonthOfNotes> {
  const res = await fetch(
    `http://localhost:5555/api/notes/${thisMonth.month}/${thisMonth.year}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    },
  );

  if (!res.ok) {
    const errorData = await res.json();
    if (res.status === 401) {
      throw new Error(errorData.error);
    } else if (res.status === 500) {
      throw new Error("Cannot get settings, try again");
    }
  }

  return await res.json();
}

async function writeANote(noteData: WriteNoteType): Promise<NoteType> {}
