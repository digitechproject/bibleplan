-- 1. Activer l'extension uuid-ossp (au cas où elle ne serait pas activée)
create extension if not exists "uuid-ossp";

-- 2. Création de la table profiles
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text not null,
    role text not null default 'participant' check (role in ('participant', 'admin')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS pour profiles
alter table public.profiles enable row level security;

create policy "Les utilisateurs peuvent voir leur propre profil."
    on public.profiles for select
    using (auth.uid() = id);

create policy "Les administrateurs peuvent voir tous les profils."
    on public.profiles for select
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid() and profiles.role = 'admin'
        )
    );

create policy "Les administrateurs peuvent modifier les profils."
    on public.profiles for update
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid() and profiles.role = 'admin'
        )
    );

-- Trigger pour créer automatiquement le profil utilisateur à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, role)
    values (
        new.id,
        new.email,
        'participant' -- Par défaut, tout le monde s'inscrit en tant que participant
    );
    return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();


-- 3. Création de la table daily_contents
create table public.daily_contents (
    date text primary key, -- Format YYYY-MM-DD
    chapter_overwrite text, -- Optionnel, si l'admin veut écraser le chapitre calculé
    teaching_title text,
    teaching_content jsonb, -- Pour stocker le format TipTap JSON
    audio_url text, -- Lien Cloudflare R2
    video_url text, -- Lien YouTube
    prayer text,
    reflection_questions jsonb default '[]'::jsonb, -- Liste de questions
    practical_exercises jsonb default '[]'::jsonb, -- Liste d'exercices
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS pour daily_contents
alter table public.daily_contents enable row level security;

create policy "Tout le monde peut lire le contenu des journées."
    on public.daily_contents for select
    using (true);

create policy "Seuls les administrateurs peuvent modifier le contenu des journées."
    on public.daily_contents for all
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid() and profiles.role = 'admin'
        )
    );


-- 4. Création de la table user_progress
create table public.user_progress (
    user_id uuid references auth.users on delete cascade not null,
    date text not null, -- Format YYYY-MM-DD
    read_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (user_id, date)
);

-- RLS pour user_progress
alter table public.user_progress enable row level security;

create policy "Les utilisateurs peuvent voir leur propre progression."
    on public.user_progress for select
    using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent insérer leur propre progression."
    on public.user_progress for insert
    with check (auth.uid() = user_id);

create policy "Les utilisateurs peuvent supprimer leur propre progression."
    on public.user_progress for delete
    using (auth.uid() = user_id);


-- 5. Création de la table user_notes
create table public.user_notes (
    user_id uuid references auth.users on delete cascade not null,
    date text not null, -- Format YYYY-MM-DD
    summary text default '',
    verses text default '',
    prayer text default '',
    decision text default '',
    application text default '',
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (user_id, date)
);

-- RLS pour user_notes
alter table public.user_notes enable row level security;

create policy "Les utilisateurs peuvent voir leurs propres notes."
    on public.user_notes for select
    using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent créer ou modifier leurs propres notes."
    on public.user_notes for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
