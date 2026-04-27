do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'hako_chat_messages'
  ) then
    create index if not exists hako_chat_messages_user_id_created_at_idx
      on public.hako_chat_messages (user_id, created_at);

    alter table public.hako_chat_messages enable row level security;

    drop policy if exists "Users can read their own hako chat messages" on public.hako_chat_messages;
    create policy "Users can read their own hako chat messages"
      on public.hako_chat_messages
      for select
      to authenticated
      using (auth.uid() = user_id);

    drop policy if exists "Users can insert their own hako chat messages" on public.hako_chat_messages;
    create policy "Users can insert their own hako chat messages"
      on public.hako_chat_messages
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;
end $$;