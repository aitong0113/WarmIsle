alter table if exists public.emotion_logs
add column if not exists note text;
