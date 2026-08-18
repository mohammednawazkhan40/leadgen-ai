-- Lead Dictionary: Migration to add normalized lead fields
-- Run this in Supabase SQL Editor

-- Add new columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS linkedin_profile_url text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source_reference text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent boolean DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS created_at_display timestamptz DEFAULT now();
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at_display timestamptz DEFAULT now();

-- Indexes for Lead Dictionary performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_industry ON leads(industry);
CREATE INDEX IF NOT EXISTS idx_leads_archived ON leads(archived);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_full_name ON leads(full_name);

-- LinkedIn campaigns table (for Marketing API data)
CREATE TABLE IF NOT EXISTS linkedin_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  campaign_id text NOT NULL,
  name text NOT NULL,
  status text DEFAULT 'active',
  type text,
  impressions integer DEFAULT 0,
  leads integer DEFAULT 0,
  spend numeric(12,2) DEFAULT 0,
  form_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- LinkedIn forms table
CREATE TABLE IF NOT EXISTS linkedin_forms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  form_id text NOT NULL,
  name text NOT NULL,
  campaign_id text,
  campaign_name text,
  status text DEFAULT 'active',
  leads_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- RLS policies
ALTER TABLE linkedin_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own linkedin_campaigns" ON linkedin_campaigns FOR ALL USING (auth.uid() = user_id);

ALTER TABLE linkedin_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own linkedin_forms" ON linkedin_forms FOR ALL USING (auth.uid() = user_id);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own audit_log" ON audit_log FOR ALL USING (auth.uid() = user_id);
