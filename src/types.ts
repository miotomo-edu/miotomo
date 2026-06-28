export type Book = {
  id: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  status: "new" | "started" | "read";
  progress: number;
  chapters: number;
  section_type: string;
  lastReadDate?: string | null;
  video_clips?: Record<string, string> | null;
};
