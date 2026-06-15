create extension if not exists pgcrypto;

create table if not exists public.parental_consents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  student_id uuid null references public.students (id) on delete set null,
  child_name text not null,
  parent_name text not null,
  consent_date date not null,
  consent_given boolean not null default true,
  consented_at timestamptz not null default timezone('utc', now()),
  consent_text_version text not null default 'v1',
  processors_disclosed jsonb not null default '[]'::jsonb,
  user_agent text null
);

alter table public.parental_consents enable row level security;

create policy "Allow anonymous inserts into parental_consents"
on public.parental_consents
for insert
to anon, authenticated
with check (true);
