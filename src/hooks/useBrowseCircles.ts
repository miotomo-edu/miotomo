import { useQuery } from "@tanstack/react-query";
import { supabase } from "./integrations/supabase/client";
import { Book as LocalBook } from "../components/sections/LibrarySection";

type CatalogRow = {
  circle_id?: string | null;
  circleId?: string | null;
  book_id?: string | null;
  bookId?: string | null;
  featured?: boolean | null;
  featured_rank?: number | null;
  featured_start?: string | null;
  featured_end?: string | null;
  is_new?: boolean | null;
  published_at?: string | null;
  popularity_score?: number | null;
  quality_score?: number | null;
  theme_tags?: string[] | string | null;
  mood_tags?: string[] | string | null;
  domain_tags?: string[] | string | null;
  age_min?: number | null;
  age_max?: number | null;
  complexity?: string | null;
  length_category?: string | null;
};

type DotProgressRow = {
  book_id?: string | null;
  episode?: number | null;
  listening_status?: string | null;
  talking_status?: string | null;
  last_active_at?: string | null;
};

export type BrowseCircle = LocalBook & {
  catalog?: CatalogRow | null;
};

export type BrowseData = {
  circles: BrowseCircle[];
  catalogRows: CatalogRow[];
  progressRows: DotProgressRow[];
};

const resolveCatalogId = (row: CatalogRow) =>
  row.circle_id ?? row.circleId ?? row.book_id ?? row.bookId ?? null;

export function useBrowseCircles(studentId?: string) {
  return useQuery({
    queryKey: ["browse-circles", studentId],
    queryFn: async (): Promise<BrowseData> => {
      const [booksResult, catalogResult, progressResult] = await Promise.all([
        supabase
          .from("books")
          .select("id, title, author, cover, chapters, section_type")
          .eq("type", "circle"),
        supabase.from("circles_catalog").select("*"),
        studentId
          ? supabase
              .from("dot_progress")
              .select(
                "book_id, episode, listening_status, talking_status, last_active_at",
              )
              .eq("student_id", studentId)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (booksResult.error) throw booksResult.error;
      if (catalogResult.error) throw catalogResult.error;
      if (progressResult.error) throw progressResult.error;

      const catalogRows = (catalogResult.data ?? []) as CatalogRow[];
      const catalogById = new Map<string, CatalogRow>();
      catalogRows.forEach((row) => {
        const id = resolveCatalogId(row);
        if (!id) return;
        catalogById.set(id, row);
      });

      const circles: BrowseCircle[] = (booksResult.data ?? []).map((book) => {
        const localBook: LocalBook = {
          id: book.id,
          title: book.title,
          author: book.author,
          thumbnailUrl: book.cover || "",
          status: "new",
          progress: 0,
          chapters: book.chapters ?? 1,
          section_type: book.section_type,
          lastReadDate: null,
        };
        return {
          ...localBook,
          catalog: catalogById.get(book.id) ?? null,
        };
      });

      return {
        circles,
        catalogRows,
        progressRows: (progressResult.data ?? []) as DotProgressRow[],
      };
    },
    enabled: studentId !== undefined,
  });
}
