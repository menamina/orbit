import { queryOptions, mutationOptions } from "@tanstack/react-query";
import type {
  ThisMonth,
  NoteType,
  MonthOfNotes,
  WriteNoteType,
  NoteToUpdate,
} from "./notesTypes";
import { apiFetch, type AuthParams } from "./api";

export const getNotesByMonthQuery = (
  thisMonth: ThisMonth,
  accessToken: string,
  onTokenRefresh?: (token: string) => void,
) => {
  return queryOptions({
    queryKey: ["userNotes", thisMonth],
    queryFn: () =>
      getNotesThisMonth(thisMonth, { accessToken, onTokenRefresh }),
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
  { accessToken, onTokenRefresh }: AuthParams,
): Promise<MonthOfNotes> {
  const res = await apiFetch(
    `http://localhost:5555/api/notes/${thisMonth.month}/${thisMonth.year}`,
    {
      accessToken,
      onTokenRefresh,
    },
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Cannot get notes, try again");
  }
  return await res.json();
}

async function writeANote({
  accessToken,
  onTokenRefresh,
  ...data
}: WriteNoteType & AuthParams): Promise<NoteType> {
  const res = await apiFetch(`http://localhost:5555/api/writeNote`, {
    method: "POST",
    accessToken,
    onTokenRefresh,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Cannot write note, try again");
  }

  return await res.json();
}

async function updateANote({
  accessToken,
  onTokenRefresh,
  ...data
}: NoteToUpdate & AuthParams): Promise<NoteType> {
  const res = await apiFetch(`http://localhost:5555/api/updateNote`, {
    method: "PATCH",
    accessToken,
    onTokenRefresh,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Cannot update note, try again");
  }

  return await res.json();
}

async function dltNote({
  noteID,
  accessToken,
  onTokenRefresh,
}: { noteID: number } & AuthParams): Promise<{ success: boolean }> {
  const res = await apiFetch(`http://localhost:5555/api/deleteNote`, {
    method: "DELETE",
    accessToken,
    onTokenRefresh,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ noteID }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Cannot delete note, try again");
  }

  return await res.json();
}
