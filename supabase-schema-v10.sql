-- Driver tracking for business accounts

create table if not exists drivers (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users on delete cascade not null,
  name varchar(200) not null,
  phone varchar(50),
  carrier varchar(200),
  checkin_token varchar(64) unique not null,
  current_status varchar(50) default 'available',
  -- available, en_route, in_line, at_bridge, cleared, delivered
  current_port_id varchar(100),
  last_checkin_at timestamptz,
  eta_minutes integer,
  notes text,
  created_at timestamptz default now()
);

alter table drivers enable row level security;
create policy "Owner manages drivers"
  on drivers for all using (auth.uid() = owner_id);
-- Drivers check in via token (no login), so we need a service-role endpoint
-- No public policy needed — check-in API uses service client

create index if not exists drivers_owner_idx on drivers(owner_id);
create index if not exists drivers_token_idx on drivers(checkin_token);
