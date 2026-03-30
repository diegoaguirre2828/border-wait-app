-- Run this in Supabase SQL Editor

-- Add subscription tier to profiles
alter table profiles add column if not exists tier varchar default 'free';
-- tiers: free, pro, business

-- Local business advertisers
create table if not exists advertisers (
  id uuid default gen_random_uuid() primary key,
  business_name varchar not null,
  contact_email varchar not null,
  contact_phone varchar,
  website varchar,
  description text,
  status varchar default 'pending', -- pending, active, paused, cancelled
  created_at timestamptz default now()
);

alter table advertisers enable row level security;
create policy "Anyone can submit advertiser application"
  on advertisers for insert with check (true);
create policy "Admins can manage advertisers"
  on advertisers for all using (true);

-- Ad creatives
create table if not exists ads (
  id uuid default gen_random_uuid() primary key,
  advertiser_id uuid references advertisers on delete cascade,
  title varchar not null,
  description varchar,
  cta_text varchar default 'Learn More',
  cta_url varchar,
  image_url varchar,
  ad_type varchar default 'sponsored_card', -- sponsored_card, nearby, fleet_banner
  -- targeting
  target_regions varchar[],   -- null = all regions
  target_ports varchar[],     -- null = all ports
  min_wait_trigger integer,   -- only show when wait > X min (for "nearby" ads)
  -- scheduling
  active boolean default true,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  -- billing
  monthly_rate integer,       -- in cents
  stripe_subscription_id varchar,
  -- stats
  impressions integer default 0,
  clicks integer default 0,
  created_at timestamptz default now()
);

alter table ads enable row level security;
create policy "Anyone can read active ads"
  on ads for select using (active = true);

-- Track ad clicks
create table if not exists ad_events (
  id uuid default gen_random_uuid() primary key,
  ad_id uuid references ads on delete cascade,
  event_type varchar not null, -- impression, click
  port_id varchar,
  created_at timestamptz default now()
);

alter table ad_events enable row level security;
create policy "Anyone can log ad events"
  on ad_events for insert with check (true);

-- Stripe subscriptions tracking
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  stripe_customer_id varchar,
  stripe_subscription_id varchar,
  tier varchar not null,       -- pro, business
  status varchar not null,     -- active, cancelled, past_due
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table subscriptions enable row level security;
create policy "Users can read own subscription"
  on subscriptions for select using (auth.uid() = user_id);
