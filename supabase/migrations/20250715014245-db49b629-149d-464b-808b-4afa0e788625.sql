-- Fix the created_by foreign key constraint for activities table
-- Drop the incorrect foreign key constraint
ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_created_by_fkey;

-- Add correct foreign key constraint to reference guides table  
ALTER TABLE public.activities 
ADD CONSTRAINT activities_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.guides(id);