-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_subscription_status TEXT NOT NULL DEFAULT 'inactive',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, company_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'company_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Transaction status enum
CREATE TYPE transaction_status AS ENUM ('sent', 'opened', 'completed');

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_phone TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT replace(replace(encode(gen_random_bytes(24), 'base64'), '+', '-'), '/', '_'),
  status transaction_status NOT NULL DEFAULT 'sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_token ON transactions(token);
CREATE INDEX idx_transactions_contractor ON transactions(contractor_id, created_at DESC);

-- Feedback
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/write their own row
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Transactions: contractors can read/write their own rows
CREATE POLICY transactions_select_own ON transactions
  FOR SELECT USING (auth.uid() = contractor_id);

CREATE POLICY transactions_insert_own ON transactions
  FOR INSERT WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY transactions_update_own ON transactions
  FOR UPDATE USING (auth.uid() = contractor_id);

-- Transactions: public SELECT for review page lookup by token
CREATE POLICY transactions_select_public ON transactions
  FOR SELECT USING (true);

-- Feedback: public INSERT (customers submit without login)
CREATE POLICY feedback_insert_public ON feedback
  FOR INSERT WITH CHECK (true);

-- Feedback: contractors can SELECT feedback for their transactions
CREATE POLICY feedback_select_contractor ON feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = feedback.transaction_id
        AND t.contractor_id = auth.uid()
    )
  );
