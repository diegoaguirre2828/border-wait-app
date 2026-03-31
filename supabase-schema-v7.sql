-- Push notification subscriptions
create table if not exists push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table push_subscriptions enable row level security;
create policy "Users manage own push subscriptions"
  on push_subscriptions for all using (auth.uid() = user_id);

-- Add phone number to alert preferences for SMS alerts
alter table alert_preferences add column if not exists phone varchar;
