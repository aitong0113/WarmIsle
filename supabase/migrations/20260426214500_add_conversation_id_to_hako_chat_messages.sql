do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'hako_chat_messages'
  ) then
    alter table public.hako_chat_messages
      add column if not exists conversation_id text;

    update public.hako_chat_messages
    set conversation_id = concat('legacy-', coalesce(user_id::text, 'guest'))
    where conversation_id is null;

    create index if not exists hako_chat_messages_user_conversation_created_idx
      on public.hako_chat_messages (user_id, conversation_id, created_at desc);

    comment on column public.hako_chat_messages.conversation_id is 'Logical conversation thread id for grouping chat sessions';
  end if;
end $$;