# Environment Setup

## Step 1: Get Clerk API Keys

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Create a new application (or use existing)
3. Copy your API keys from the dashboard

## Step 2: Get Supabase Database URL

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project (or use existing)
3. Get your database URL from Project Settings → Database → Connection string (URI)

## Step 3: Create .env.local file

Create a `.env.local` file in the root directory with:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI API
OPENAI_API_KEY=sk-proj-your_openai_api_key_here

# ElevenLabs TTS
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

Replace the placeholder values with your actual keys.

### Get API Keys

**OpenAI:**
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy the key and add it to `.env.local`

**ElevenLabs:**
1. Go to [https://elevenlabs.io](https://elevenlabs.io) and sign up
2. Go to Profile → API Keys
3. Copy your API key
4. Add to `.env.local`

**Supabase Storage:**
1. Go to your Supabase project settings
2. API section → Project URL (NEXT_PUBLIC_SUPABASE_URL)
3. API section → service_role key (SUPABASE_SERVICE_ROLE_KEY)
4. The storage bucket will be created automatically

See `DATABASE_SETUP.md` for detailed database setup instructions.

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Setup Database

Generate and run database migrations:

```bash
npm run db:generate
npm run db:migrate
```

See `DATABASE_SETUP.md` for detailed database instructions.

## Step 6: Run the App

```bash
npm run dev
```

## Protected Routes

The following routes are protected and require authentication:
- `/dashboard`
- `/project/*`
- `/voices`
- `/settings`

Public routes:
- `/sign-in`
- `/sign-up`

