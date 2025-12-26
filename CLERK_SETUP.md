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
```

Replace the placeholder values with your actual keys.

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

