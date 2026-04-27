do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'hako_chat_messages'
  ) then
    drop policy if exists "Users can delete their own hako chat messages" on public.hako_chat_messages;
    create policy "Users can delete their own hako chat messages"
      on public.hako_chat_messages
      for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;