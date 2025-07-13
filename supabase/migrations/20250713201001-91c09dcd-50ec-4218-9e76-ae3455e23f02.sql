-- Drop the existing restrictive admin policy
DROP POLICY IF EXISTS "Admin can manage guides" ON public.guides;

-- Create a more permissive policy for admin operations
-- Allow anyone to insert guides (for admin functionality)
CREATE POLICY "Allow guide creation" 
ON public.guides 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to read all guides (for admin functionality)  
CREATE POLICY "Allow guide reading" 
ON public.guides 
FOR SELECT 
USING (true);

-- Still keep the guide-specific policies for guide users
-- (These policies will work when we implement guide authentication properly)