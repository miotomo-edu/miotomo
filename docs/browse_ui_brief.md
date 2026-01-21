# Circles Browse UI Brief (Netflix-style)

## Goal
Define a Netflix/AppleTV/Disney-style browse experience for Circles. This document describes the main library view, navigation, and row logic at a high level. It assumes the existing single-circle detail view with all dots already exists and should be kept.

## Scope
- Main library view (browse/home)
- Row types, ordering, and data sources
- Navigation between rows, search, and detail view

Out of scope:
- HTML/CSS/JS implementation details
- Changes to the existing single-circle view

## Data Sources (Supabase)
- `books` (circles): core identity
  - `id`, `title`, `cover`, `author`, `section_type`, `type`, `is_synthetic`
- `circles_catalog`: browse metadata
  - `featured`, `featured_rank`, `featured_start`, `featured_end`
  - `is_new`, `published_at`
  - `popularity_score`, `quality_score`
  - `theme_tags`, `domain_tags`, `mood_tags`
  - `age_min`, `age_max`, `complexity`, `length_category`
- `circles_dots`: per-episode info
  - `circle_id`, `episode`, `duration`, `title`, `audio`
- `dot_progress`: user progress for Continue row
  - `student_id`, `book_id`, `episode`, `listening_status`, `talking_status`, `last_active_at`

## Main Library View
A vertical stack of horizontal rows (carousels). Each row is a filtered collection of circles. Clicking a card opens the existing single-circle view with dots.

Suggested top-level layout:
1) Hero / Featured
2) Continue
3) New
4) Theme rows (multiple)
5) Mood rows (multiple)
6) Length rows (quick/medium/long)
7) Domain rows (optional)

### 1) Hero / Featured Row
- Source: `circles_catalog.featured = true`
- Sort: `featured_rank` ASC, fallback `published_at` DESC
- Display: large card with title + cover

### 2) Continue Row (per user)
- Source: `dot_progress` where `student_id = <current child>`
  - `listening_status` or `talking_status` in `in_progress` / `paused`
- Join to `books` by `book_id`
- Sort by `dot_progress.last_active_at` DESC

### 3) New Row
- Source: `circles_catalog.is_new = true` OR `published_at` within recent window
- Sort: `published_at` DESC

### 4) Theme Rows
Create multiple rows from `theme_tags` buckets (e.g., nature, big-questions, feelings, how-things-work, history, imagination).
- Filter: `theme_tags` contains bucket
- Sort: `popularity_score` DESC, then `quality_score` DESC

### 5) Mood Rows
Create multiple rows from `mood_tags` buckets (curious, contemplative, playful, serious, imaginative).
- Filter: `mood_tags` contains bucket
- Sort: `quality_score` DESC

### 6) Length Rows
- Filter: `length_category` = quick / medium / long
- Sort: `popularity_score` DESC

### 7) Domain Rows (optional)
Create rows from `domain_tags` buckets (science, philosophy, emotions, animals, space, time, people, nature, technology).

## Card Content (Browse)
Each circle card should include:
- `books.title`
- `books.cover`
- Optional: `circles_catalog.mood_tags` (one primary)
- Optional: age range from `circles_catalog.age_min/age_max`
- Optional: length via `circles_catalog.length_category` or total duration sum from `circles_dots.duration`

## Navigation
- Row -> circle detail: click a card to open the existing single-circle view (do not change that view).
- Continue row: clicking should deep-link to the circle detail, optionally highlighting the last episode (from `dot_progress.episode`).

## UX Notes
- Hide empty rows (no results).
- Use `books.is_synthetic` if you need to filter synthetic data in production.
- If `cover` is missing, use a placeholder image.

## Success Criteria
- All rows populate from Supabase with no backend dependency.
- Browse feels dense and fast, with visible variety across themes/moods/lengths.
- Continue row reflects the current user state.
