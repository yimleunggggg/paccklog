alter table public.trips
drop constraint if exists trips_user_id_fkey;

alter table public.trips
add constraint trips_user_id_fkey
foreign key (user_id) references auth.users(id) on delete cascade;
