-- Workspaces and snapshots schema

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  title text,
  source_url text not null,
  provider text check (provider in ('github','huggingface','zip')) default 'zip',
  created_at timestamptz default now()
);

alter table public.workspaces enable row level security;

create policy "workspaces_public_read"
  on public.workspaces for select
  using (true);

create policy "workspaces_owner_write"
  on public.workspaces for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create table if not exists public.workspace_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  message text,
  storage_key text, -- path to snapshot artifact (e.g., local path or storage bucket key)
  created_at timestamptz default now()
);

alter table public.workspace_snapshots enable row level security;

create policy "snapshots_public_read"
  on public.workspace_snapshots for select
  using (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_id
    )
  );

create policy "snapshots_owner_write"
  on public.workspace_snapshots for all
  using (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.owner_id = auth.uid()
    )
  );

create index if not exists idx_workspaces_owner on public.workspaces(owner_id);
create index if not exists idx_snapshots_workspace on public.workspace_snapshots(workspace_id);


