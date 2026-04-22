create table if not exists public.community_template_likes (
  template_id uuid not null references public.community_templates(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (template_id, user_id)
);

alter table public.community_template_likes enable row level security;

drop policy if exists "community_template_likes_select_own" on public.community_template_likes;
create policy "community_template_likes_select_own"
on public.community_template_likes
for select
using (user_id = auth.uid());

drop policy if exists "community_template_likes_insert_own" on public.community_template_likes;
create policy "community_template_likes_insert_own"
on public.community_template_likes
for insert
with check (user_id = auth.uid());

drop policy if exists "community_template_likes_delete_own" on public.community_template_likes;
create policy "community_template_likes_delete_own"
on public.community_template_likes
for delete
using (user_id = auth.uid());
