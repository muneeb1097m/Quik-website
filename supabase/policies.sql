-- 1. Enable RLS on all tables
ALTER TABLE "NewsEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Signal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Brief" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Source" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies

-- Policy for NewsEvent: Public Read Access
CREATE POLICY "Enable read access for all users"
ON "NewsEvent"
FOR SELECT
TO public
USING (true);

-- Policy for Signal: Public Read Access
CREATE POLICY "Enable read access for all users"
ON "Signal"
FOR SELECT
TO public
USING (true);

-- Policy for Brief: Public Read Access
CREATE POLICY "Enable read access for all users"
ON "Brief"
FOR SELECT
TO public
USING (true);

-- Policy for Source: Public Read Access
CREATE POLICY "Enable read access for all users"
ON "Source"
FOR SELECT
TO public
USING (true);

-- Policy for Subscription: Public Insert Access (for signups)
-- Note: We do NOT add a SELECT policy for public here to protect email addresses.
CREATE POLICY "Enable insert for all users"
ON "Subscription"
FOR INSERT
TO public
WITH CHECK (true);
