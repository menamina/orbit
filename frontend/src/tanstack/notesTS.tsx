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

export const dltNoteMut = () => {
  return mutationOptions({
    mutationFn: dltNote,
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
    if (res.status === 500) {
      throw new Error("Cannot delete note, try again");
    } else {
      throw new Error(errorData.error);
    }
  }
  return await res.json();
}

async function writeANote(
  params: WriteNoteType & { accessToken: string },
): Promise<NoteType> {
  const { accessToken, ...data } = params;
  const res = await fetch(`http://localhost:5555/api/writeNote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    if (res.status === 500) {
      throw new Error("Cannot delete note, try again");
    } else {
      throw new Error(errorData.error);
    }
  }

  return await res.json();
}

async function updateANote(
  params: { noteID: number; note: string; accessToken: string },
): Promise<NoteType> {
  const { accessToken, ...data } = params;
  const res = await fetch(`http://localhost:5555/api/updateNote`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    if (res.status === 500) {
      throw new Error("Cannot delete note, try again");
    } else {
      throw new Error(errorData.error);
    }
  }

  return await res.json();
}

async function dltNote(
  params: { noteID: number; accessToken: string },
): Promise<{ success: boolean }> {
  const { accessToken, noteID } = params;
  const res = await fetch(`http://localhost:5555/api/deleteNote`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
    body: JSON.stringify({ noteID }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    if (res.status === 500) {
      throw new Error("Cannot delete note, try again");
    } else {
      throw new Error(errorData.error);
    }
  }

  return await res.json();
}
