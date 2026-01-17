import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./integrations/supabase/client";
import { Book as LocalBook } from "../components/sections/LibrarySection";
import type { TablesUpdate } from "./integrations/supabase/types";

export function useBooks(studentId: string) {
  const queryClient = useQueryClient();

  const booksQuery = useQuery({
    queryKey: ["books", studentId],
    queryFn: async (): Promise<LocalBook[]> => {
      // Library view shows all books, independent of student assignments.
      const { data, error } = await supabase
        .from("books")
        .select("id, title, author, cover, chapters, section_type")
        .eq("type", "circle");

      if (error) throw error;

      return (data ?? []).map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        thumbnailUrl: book.cover || "",
        status: "new",
        progress: 0,
        chapters: book.chapters ?? 1,
        section_type: book.section_type,
        lastReadDate: null,
      }));
    },
    enabled: studentId !== undefined, // Only run if studentId is defined
  });

  const updateBookProgress = useMutation({
    mutationFn: async ({
      studentId,
      bookId,
      progress,
      status,
    }: {
      studentId: string;
      bookId: string;
      progress: number;
      status?: "new" | "started" | "read";
    }) => {
      // First, check if the student_book record exists
      const { data: existingRecord, error: fetchError } = await supabase
        .from("student_books")
        .select("id")
        .eq("student_id", studentId)
        .eq("book_id", bookId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 is "not found" - other errors should be thrown
        throw fetchError;
      }

      // Prepare update data
      const updateData: TablesUpdate<"student_books"> = {
        progress,
        last_read_date: new Date().toISOString(),
      };

      // Auto-update status based on progress if not explicitly provided
      if (status) {
        updateData.status = status;
      } else if (progress > 0) {
        updateData.status = "started";
      }

      if (existingRecord) {
        // Update existing record
        const { data, error } = await supabase
          .from("student_books")
          .update(updateData)
          .eq("id", existingRecord.id)
          .select();

        if (error) throw error;
        return data;
      } else {
        // Create new record if it doesn't exist
        const { data, error } = await supabase
          .from("student_books")
          .insert({
            student_id: studentId,
            book_id: bookId,
            progress,
            status: status || (progress > 0 ? "started" : "new"),
            last_read_date: new Date().toISOString(),
            assigned_date: new Date().toISOString(),
          })
          .select();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch books data
      queryClient.invalidateQueries({ queryKey: ["books", studentId] });
    },
    onError: (error) => {
      console.error("Error updating book progress:", error);
    },
  });

  return {
    ...booksQuery,
    updateBookProgress: updateBookProgress.mutate,
    updateBookProgressAsync: updateBookProgress.mutateAsync,
    isUpdating: updateBookProgress.isPending,
    updateError: updateBookProgress.error,
  };
}
