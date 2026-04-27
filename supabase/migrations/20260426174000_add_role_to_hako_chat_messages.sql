do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'hako_chat_messages'
  ) then
    alter table public.hako_chat_messages
      add column if not exists role text not null default 'user';

    update public.hako_chat_messages
    set role = 'user'
    where role is null;

    comment on column public.hako_chat_messages.role is 'Message author role: user or assistant';
  end if;
end $$;