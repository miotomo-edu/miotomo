import { useQuery } from "@tanstack/react-query";
import { supabase } from "./integrations/supabase/client";

const HARDCODED_STUDENT_ID = "052f53c5-f0a1-4397-87d0-7cf9b8fa284f";

// Helper function to get date string in YYYY-MM-DD format
const getDateString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Helper function to calculate consecutive days streak
const calculateStreak = (conversationDates: string[]): number => {
  if (conversationDates.length === 0) return 0;

  // Get unique dates and sort them in descending order (most recent first)
  const uniqueDates = [...new Set(conversationDates)]
    .map((dateStr) => new Date(dateStr))
    .sort((a, b) => b.getTime() - a.getTime())
    .map((date) => getDateString(date));

  const today = getDateString(new Date());
  let streak = 0;
  let currentDate = new Date();

  // Check if there's activity today or yesterday to start the streak
  const hasActivityToday = uniqueDates.includes(today);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const hasActivityYesterday = uniqueDates.includes(getDateString(yesterday));

  if (!hasActivityToday && !hasActivityYesterday) {
    return 0; // No recent activity
  }

  // Start from today if there's activity today, otherwise start from yesterday
  if (!hasActivityToday) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Count consecutive days backwards
  for (let i = 0; i < uniqueDates.length; i++) {
    const checkDate = getDateString(currentDate);

    if (uniqueDates.includes(checkDate)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

export function useStudent(studentId = HARDCODED_STUDENT_ID) {
  return useQuery({
    queryKey: ["student", studentId],
    queryFn: async () => {
      // Fetch student data
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .eq("enabled", true)
        .single();

      if (studentError) throw studentError;

      // Fetch conversation dates for streak calculation
      const { data: conversations, error: conversationsError } = await supabase
        .from("conversations")
        .select("created_at")
        .eq("student_id", studentId)
        .not("created_at", "is", null)
        .order("created_at", { ascending: false });

      if (conversationsError) {
        console.warn(
          "Failed to fetch conversations for streak calculation:",
          conversationsError,
        );
        // Return student data without streak if conversations fetch fails
        return {
          ...studentData,
          streak: 0,
        };
      }

      // Calculate streak
      const conversationDates =
        conversations?.map((conv) => conv.created_at!) || [];
      const streak = calculateStreak(conversationDates);

      return {
        ...studentData,
        streak,
      };
    },
  });
}

// Export the constant for reuse elsewhere
export { HARDCODED_STUDENT_ID };
