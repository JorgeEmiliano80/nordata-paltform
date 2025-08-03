
-- Delete all client profiles from the database
DELETE FROM public.profiles 
WHERE role = 'client';
