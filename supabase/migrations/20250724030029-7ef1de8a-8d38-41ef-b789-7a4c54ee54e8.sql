-- Add family member columns to guide_requests table
ALTER TABLE public.guide_requests 
ADD COLUMN adults_count integer DEFAULT 1 CHECK (adults_count >= 1 AND adults_count <= 10),
ADD COLUMN children_count integer DEFAULT 0 CHECK (children_count >= 0 AND children_count <= 10);