import { useQuery } from "@tanstack/react-query";
import { supabase } from "./integrations/supabase/client";
import { Book as LocalBook } from "../components/sections/LibrarySection";

export function useBooks(studentId: string) {
  return useQuery({
    queryKey: ["books", studentId],
    queryFn: async (): Promise<LocalBook[]> => {
      // Wildcard: load all books if studentId is "all" or empty
      if (studentId === "vasu2015") {
        const { data, error } = await supabase.from("books").select("*");
        if (error) throw error;
        return (data ?? []).map((book) => ({
          id: book.id,
          title: book.title,
          author: book.author,
          thumbnailUrl: book.cover || "",
          status: "new", // Default status
          progress: 0, // Default progress
        }));
      }

      // Otherwise, load only books for the student
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

      if (error) throw error;

      return (data ?? []).map((item) => ({
        id: item.book.id,
        title: item.book.title,
        author: item.book.author,
        thumbnailUrl: item.book.cover || "",
        status: item.status as "new" | "started" | "read",
        progress: item.progress,
      }));
    },
    enabled: studentId !== undefined, // Only run if studentId is defined
  });
}
