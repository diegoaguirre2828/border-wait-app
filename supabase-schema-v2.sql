-- Run this in your Supabase SQL editor (in addition to the first schema)

-- Users profile table (extends Supabase auth)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name varchar,
  role varchar default 'driver',   -- driver, fleet_manager, admin
  company varchar,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Crowdsourced reports table
create table if not exists crossing_reports (
  id uuid default gen_random_uuid() primary key,
  port_id varchar not null,
  user_id uuid references auth.users on delete set null,
  report_type varchar not null,  -- delay, accident, inspection, clear, other
  description text,
  severity varchar default 'medium',  -- low, medium, high
  verified boolean default false,
  upvotes integer default 0,
  created_at timestamptz default now()
);

create index if not exists idx_reports_port_time
  on crossing_reports (port_id, created_at desc);

alter table crossing_reports enable row level security;
create policy "Anyone can read reports" on crossing_reports for select using (true);
create policy "Authenticated users can submit reports"
  on crossing_reports for insert
  with check (auth.uid() = user_id);

-- Saved/favorite crossings
create table if not exists saved_crossings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  port_id varchar not null,
  label varchar,  -- custom nickname e.g. "My daily crossing"
  created_at timestamptz default now(),
  unique(user_id, port_id)
);

alter table saved_crossings enable row level security;
create policy "Users manage own saved crossings"
  on saved_crossings for all using (auth.uid() = user_id);

-- Alert preferences
create table if not exists alert_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  port_id varchar not null,
  lane_type varchar default 'vehicle',
  threshold_minutes integer not null,
  active boolean default true,
  created_at timestamptz default now()
);

alter table alert_preferences enable row level security;
create policy "Users manage own alerts"
  on alert_preferences for all using (auth.uid() = user_id);
