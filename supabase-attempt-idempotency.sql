-- WordSpring: make queued learner-attempt sync idempotent.
-- Apply this to the Supabase project used by auth.js (project ref tlqqawiaoqbfxvqhnpof).
-- Existing rows may keep a NULL client_id. PostgreSQL UNIQUE indexes allow multiple NULLs,
-- while new client-generated IDs are protected from duplicates per account.

alter table public.attempts
  add column if not exists client_id uuid;

-- Replace the earlier partial index so PostgREST/Supabase can infer this conflict target
-- for upsert(..., { onConflict: 'owner_id,client_id' }).
drop index if exists public.attempts_owner_client_id_uidx;

create unique index if not exists attempts_owner_client_id_uidx
  on public.attempts (owner_id, client_id);

comment on column public.attempts.client_id is
  'Client-generated UUID used to make offline queue retries idempotent.';

-- Verification after deployment:
-- select owner_id, client_id, count(*)
-- from public.attempts
-- where client_id is not null
-- group by owner_id, client_id
-- having count(*) > 1;
