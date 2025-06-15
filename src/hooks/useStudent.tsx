import { useQuery } from "@tanstack/react-query";
import { supabase } from "./integrations/supabase/client";

const HARDCODED_STUDENT_ID = "d4d08e82-37de-4264-b56e-f750868f1600";

export function useStudent(studentId = HARDCODED_STUDENT_ID) {
  return useQuery({
    queryKey: ["student", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single();

      if (error) throw error;

      return data;
    },
  });
}

// Export the constant for reuse elsewhere
export { HARDCODED_STUDENT_ID };
