-- TradePath IL — initial schema
-- Run in a new Supabase project. Lessons, quizzes, cards and the glossary live in the repo (content/), not in the database.

create extension if not exists pgcrypto;

-- ---------- profiles ----------
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  display_name        text,
  weekly_minutes_goal int  not null default 150 check (weekly_minutes_goal between 30 and 1200),
  chosen_style        text not null default 'undecided'
                      check (chosen_style in ('undecided','investor','position','swing','day','scalp')),
  learning_budget_ils numeric(12,2),              -- "money I can afford to lose", set in stage 0
  contract_signed_at  timestamptz,                -- stage 0 learning contract
  created_at          timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;

-- SECURITY DEFINER: only the trigger may run it, never the API roles.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- learning progress ----------
create table public.lesson_progress (
  user_id       uuid not null references auth.users(id) on delete cascade,
  lesson_id     text not null,
  status        text not null check (status in ('started','completed')),
  seconds_spent int  not null default 0,
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  primary key (user_id, lesson_id)
);

create table public.quiz_attempts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  quiz_id    text not null,                       -- lesson id, or 'gate-s1'
  score      numeric(5,2) not null check (score between 0 and 100),
  passed     boolean not null,
  answers    jsonb not null,
  created_at timestamptz not null default now()
);
create index quiz_attempts_user_quiz on public.quiz_attempts (user_id, quiz_id, created_at desc);

create table public.card_state (                  -- Leitner boxes
  user_id          uuid not null references auth.users(id) on delete cascade,
  card_id          text not null,
  box              smallint not null default 1 check (box between 1 and 5),
  due_on           date not null default current_date,
  reviews          int not null default 0,
  lapses           int not null default 0,
  last_reviewed_at timestamptz,
  primary key (user_id, card_id)
);
create index card_state_due on public.card_state (user_id, due_on);

create table public.drill_attempts (              -- ExerciseEngine and chart drills
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  widget     text not null,
  item_id    text not null,
  correct    boolean not null,
  detail     jsonb,
  created_at timestamptz not null default now()
);
create index drill_attempts_user_widget on public.drill_attempts (user_id, widget, created_at desc);

create table public.stage_gates (
  user_id     uuid not null references auth.users(id) on delete cascade,
  stage       smallint not null check (stage between 0 and 7),
  requirement text not null,                      -- 'exam', 'task', ...
  passed_at   timestamptz not null default now(),
  evidence    jsonb,
  primary key (user_id, stage, requirement)
);

-- ---------- practice ----------
create table public.instruments (               -- simulator universe; values are illustrative config, not a broker's terms
  symbol            text primary key,               -- e.g. 'EUR/USD', 'AAPL'
  provider_symbol   text not null,
  name_he           text not null,
  class             text not null check (class in ('forex','share','etf','crypto')),
  base_ccy          text,
  quote_ccy         text not null,
  price_decimals    smallint not null,
  qty_min           numeric(18,6) not null,
  qty_step          numeric(18,6) not null,
  base_spread       numeric(18,6) not null,
  leverage          numeric(6,2)  not null check (leverage >= 1),
  maintenance_ratio numeric(4,3)  not null default 0.5,
  funding_long      numeric(10,7) not null default 0,   -- daily rate, signed
  funding_short     numeric(10,7) not null default 0,
  funding_time_utc  time not null default '21:00',
  funding_triple_dow smallint not null default 3,        -- 0=Sunday
  gsl_available     boolean not null default false,
  gsl_premium       numeric(18,6),
  gsl_min_distance  numeric(18,6),
  hours_note_he     text,
  active            boolean not null default true
);

create table public.sim_accounts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  name             text not null,
  currency         text not null default 'USD' check (currency in ('USD','ILS')),
  starting_balance numeric(14,2) not null check (starting_balance > 0),
  balance          numeric(14,2) not null,
  max_leverage     numeric(6,2) not null default 10,
  last_settled_at  timestamptz not null default now(),   -- sim time cursor, see docs/10-SIMULATOR.md section 6
  created_at       timestamptz not null default now()
);

create table public.sim_positions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  account_id       uuid not null references public.sim_accounts(id) on delete cascade,
  symbol           text not null references public.instruments(symbol),
  side             text not null check (side in ('long','short')),
  quantity         numeric(18,6) not null check (quantity > 0),
  open_price       numeric(18,6) not null,
  opened_at        timestamptz not null,                 -- sim time
  initial_margin   numeric(14,2) not null,
  stop_price       numeric(18,6) not null,               -- Close at Loss is mandatory
  stop_kind        text not null default 'normal' check (stop_kind in ('normal','trailing','guaranteed')),
  trailing_distance numeric(18,6),
  take_profit      numeric(18,6),
  funding_total    numeric(14,2) not null default 0,
  status           text not null default 'open' check (status in ('open','closed')),
  close_price      numeric(18,6),
  closed_at        timestamptz,
  close_reason     text check (close_reason in ('manual','close_at_loss','close_at_profit','trailing','guaranteed','stop_out')),
  realized_pnl     numeric(14,2),
  parent_id        uuid references public.sim_positions(id),  -- set on the closed part of a partial close
  created_at       timestamptz not null default now()
);
create index sim_positions_open on public.sim_positions (account_id) where status = 'open';

create table public.sim_orders (                  -- pending entry orders
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  account_id       uuid not null references public.sim_accounts(id) on delete cascade,
  symbol           text not null references public.instruments(symbol),
  side             text not null check (side in ('long','short')),
  kind             text not null check (kind in ('limit','stop')),
  level            numeric(18,6) not null,
  quantity         numeric(18,6) not null check (quantity > 0),
  stop_price       numeric(18,6) not null,
  stop_kind        text not null default 'normal' check (stop_kind in ('normal','trailing','guaranteed')),
  trailing_distance numeric(18,6),
  take_profit      numeric(18,6),
  setup            text,
  reason           text,
  expires_at       timestamptz,
  status           text not null default 'pending' check (status in ('pending','filled','cancelled','expired','rejected')),
  status_note      text,
  position_id      uuid references public.sim_positions(id),
  created_at       timestamptz not null default now()
);
create index sim_orders_pending on public.sim_orders (account_id) where status = 'pending';

create table public.sim_ledger (                  -- every balance change, append-only
  id            bigint generated always as identity primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  account_id    uuid not null references public.sim_accounts(id) on delete cascade,
  ts            timestamptz not null,               -- sim time
  kind          text not null check (kind in ('deposit','realized_pnl','funding','gsl_premium','conversion_fee','negative_balance_reset','account_reset')),
  amount        numeric(14,2) not null,
  balance_after numeric(14,2) not null,
  position_id   uuid references public.sim_positions(id),
  note          text
);
create index sim_ledger_account_ts on public.sim_ledger (account_id, ts desc);

create table public.sim_alerts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  symbol      text not null references public.instruments(symbol),
  direction   text not null check (direction in ('above','below')),
  level       numeric(18,6) not null,
  triggered_at timestamptz,
  created_at  timestamptz not null default now()
);

create table public.trades (                      -- one row = one journal entry
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  account_id     uuid references public.sim_accounts(id) on delete set null,
  position_id    uuid references public.sim_positions(id) on delete set null,  -- set for simulator trades
  mode           text not null check (mode in ('backtest','paper','external_demo')),
  symbol         text not null,
  side           text not null check (side in ('long','short')),
  quantity       numeric(18,6) not null check (quantity > 0),
  entry_price    numeric(18,6) not null,
  stop_price     numeric(18,6) not null,          -- a stop is mandatory
  target_price   numeric(18,6),
  exit_price     numeric(18,6),
  fees           numeric(14,2) not null default 0,
  opened_at      timestamptz not null,
  closed_at      timestamptz,
  r_multiple     numeric(8,3),
  pnl            numeric(14,2),
  setup          text,                            -- strategy card name
  reason         text,                            -- why I entered, written before the outcome
  followed_plan  boolean,
  rule_breaks    text[],
  emotion_before text,
  emotion_after  text,
  lesson_learned text,
  screenshot_path text,
  tags           text[] not null default '{}',
  created_at     timestamptz not null default now()
);
create index trades_user_mode_time on public.trades (user_id, mode, opened_at desc);

create table public.trading_plans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  version    int  not null,
  content    jsonb not null,
  change_note text,
  is_active  boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, version)
);
create unique index trading_plans_one_active on public.trading_plans (user_id) where is_active;

create table public.weekly_reviews (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  content    jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create table public.tutor_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  lesson_id  text,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);
create index tutor_messages_user_time on public.tutor_messages (user_id, created_at desc);

-- ---------- market data cache (shared, read-only for learners) ----------
create table public.price_bars (
  symbol    text not null,
  timeframe text not null check (timeframe in ('1d','1h','5m','1m')),
  ts        timestamptz not null,
  open      numeric(18,6) not null,
  high      numeric(18,6) not null,
  low       numeric(18,6) not null,
  close     numeric(18,6) not null,
  volume    numeric(20,2),
  source    text not null,
  primary key (symbol, timeframe, ts),
  check (high >= greatest(open, close) and low <= least(open, close))
);

-- ---------- row level security ----------
alter table public.profiles        enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quiz_attempts   enable row level security;
alter table public.card_state      enable row level security;
alter table public.drill_attempts  enable row level security;
alter table public.stage_gates     enable row level security;
alter table public.instruments     enable row level security;
alter table public.sim_accounts    enable row level security;
alter table public.sim_positions   enable row level security;
alter table public.sim_orders      enable row level security;
alter table public.sim_ledger      enable row level security;
alter table public.sim_alerts      enable row level security;
alter table public.trades          enable row level security;
alter table public.trading_plans   enable row level security;
alter table public.weekly_reviews  enable row level security;
alter table public.tutor_messages  enable row level security;
alter table public.price_bars      enable row level security;

create policy own_profile on public.profiles
  for all to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

do $$
declare t text;
begin
  foreach t in array array[
    'lesson_progress','quiz_attempts','card_state','drill_attempts','stage_gates',
    'trades','trading_plans','weekly_reviews','tutor_messages','sim_alerts'
  ] loop
    execute format(
      'create policy own_rows on public.%I for all to authenticated
         using (user_id = (select auth.uid()))
         with check (user_id = (select auth.uid()))', t);
  end loop;
end $$;

-- Simulator state is written only by the server engine (direct connection, see docs/10-SIMULATOR.md).
-- Learners may read their own rows and nothing else.
do $$
declare t text;
begin
  foreach t in array array['sim_accounts','sim_positions','sim_orders','sim_ledger'] loop
    execute format(
      'create policy read_own on public.%I for select to authenticated
         using (user_id = (select auth.uid()))', t);
  end loop;
end $$;

create policy read_instruments on public.instruments
  for select to authenticated using (true);

-- Learners can read cached bars. Only the service role (which bypasses RLS) writes them.
-- The simulator shows prices shifted by FEED_OFFSET (8 weeks). Bars newer than "sim now" stay hidden.
-- Keep this interval equal to FEED_OFFSET_WEEKS in lib/sim/config.ts.
create policy read_bars on public.price_bars
  for select to authenticated using (ts <= now() - interval '8 weeks');
