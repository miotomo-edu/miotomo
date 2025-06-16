import { useQuery } from "@tanstack/react-query";
import { supabase } from "./integrations/supabase/client";

const HARDCODED_STUDENT_ID = "052f53c5-f0a1-4397-87d0-7cf9b8fa284f";

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
