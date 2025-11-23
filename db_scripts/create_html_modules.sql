create table if not exists public.html_modules (
  id uuid not null default gen_random_uuid (),
  title text not null,
  content text not null,
  is_active boolean not null default true,
  order_index integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint html_modules_pkey primary key (id)
);

-- Add RLS policies
alter table public.html_modules enable row level security;

-- Policy for reading (public can read active modules, admins can read all)
create policy "Enable read access for all users"
on public.html_modules
for select
using (true);

-- Policy for admin management
create policy "Enable all access for admin users"
on public.html_modules
for all
using (
  auth.uid() in (
    select id from profiles where role = 'admin'
  )
);

-- Create trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_html_modules_updated_at
before update on public.html_modules
for each row
execute procedure public.handle_updated_at();
