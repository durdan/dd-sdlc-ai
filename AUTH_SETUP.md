# Authentication Setup Guide

This guide will help you set up the authentication system for the SDLC Automation Platform.

## Prerequisites

1. A Supabase project (https://supabase.com/)
2. Node.js 18+ and npm/yarn/pnpm installed
3. Git installed

## Setup Instructions

### 1. Supabase Configuration

1. Create a new project on [Supabase](https://supabase.com/)
2. Go to Project Settings > API
3. Copy the following values:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - Public Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 2. Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Enable Authentication Providers

In your Supabase project:

1. Go to Authentication > Providers
2. Enable the following providers:
   - Email/Password
   - Google (requires OAuth client ID and secret)

### 4. Database Setup

1. In your Supabase project, go to SQL Editor
2. Create a `profiles` table by running the following SQL:

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a function to handle new user signups
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, username, avatar_url)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'email',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 5. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-ui-react @supabase/auth-ui-shared
```

### 6. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application in action.

## Testing the Authentication Flow

1. **Sign Up**
   - Click "Sign In"
   - Switch to "Create an Account"
   - Fill in your details and sign up
   - Check your email for the confirmation link

2. **Sign In**
   - Click "Sign In"
   - Enter your credentials
   - You should be redirected to the dashboard

3. **Sign Out**
   - Click on your profile picture in the top-right corner
   - Click "Sign Out"
   - You should be redirected to the home page

## Troubleshooting

- **Authentication issues**: Make sure you've enabled the correct providers in Supabase
- **Database errors**: Verify the `profiles` table exists and has the correct permissions
- **Environment variables**: Ensure all required variables are set in `.env.local`

## Next Steps

- [ ] Implement password reset functionality
- [ ] Add user profile management
- [ ] Set up email templates in Supabase
- [ ] Add more authentication providers (GitHub, Twitter, etc.)
- [ ] Implement role-based access control (RBAC)
