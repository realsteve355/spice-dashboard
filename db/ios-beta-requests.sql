-- Run by hand in the Supabase SQL editor (project jhzbxiolczviwremgalv, same one
-- api/log.js already writes to). Backs the iOS beta "request access" form on the
-- marketing site homepage.

create table if not exists ios_beta_requests (
  id                     bigint generated always as identity primary key,
  name                   text not null,
  email                  text not null,
  organization           text,
  interested_investor    boolean not null default false,
  interested_pilot_site  boolean not null default false,
  created_at             timestamptz not null default now()
);

alter table ios_beta_requests enable row level security;

-- Public form submits with the anon key — allow inserts only, no read/update/delete
-- from the client (review submissions via the Supabase dashboard directly).
create policy "anon can insert beta requests"
  on ios_beta_requests for insert
  to anon
  with check (true);
