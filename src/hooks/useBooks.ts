import { useQuery } from "@tanstack/react-query";
import { supabase } from "./integrations/supabase/client";
import { Book as LocalBook } from "../components/sections/LibrarySection";

export function useBooks(studentId) {
  return useQuery({
    queryKey: ["books", studentId],
    queryFn: async (): Promise<LocalBook[]> => {
      if (!studentId) return [];
      const { data, error } = await supabase
        .from("student_books")
        .select(
          `
          status,
          progress,
          book:books (
            id,
            title,
            author,
            cover
          )
        `,
        )
        .eq("student_id", studentId);

      if (error) {
        throw error;
      }

      return (data ?? []).map((item) => ({
        id: item.book.id,
        title: item.book.title,
        author: item.book.author,
        thumbnailUrl: item.book.cover || "",
        status: item.status as "new" | "started" | "read",
        progress: item.progress,
      }));
    },
    enabled: !!studentId, // Only run if studentId is present
  });
}
