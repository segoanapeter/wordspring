-- WordSpring: make queued learner-attempt sync idempotent.
-- Apply this to the Supabase project used by auth.js (project ref tlqqawiaoqbfxvqhnpof)
-- before adding client_id to the browser insert payload.

alter table public.attempts
  add column if not exists client_id uuid;

-- Existing rows pre-date client IDs, so null remains allowed for backwards compatibility.
create unique index if not exists attempts_owner_client_id_uidx
  on public.attempts (owner_id, client_id)
  where client_id is not null;

comment on column public.attempts.client_id is
  'Client-generated UUID used to make offline queue retries idempotent.';

-- Verification after deployment:
-- select owner_id, client_id, count(*)
-- from public.attempts
-- where client_id is not null
-- group by owner_id, client_id
-- having count(*) > 1;
