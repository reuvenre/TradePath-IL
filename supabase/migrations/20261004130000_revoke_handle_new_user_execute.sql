-- The sign-up trigger function is SECURITY DEFINER; nobody needs to call it through the API.
-- Clears the Supabase advisor warnings 0028 and 0029. The trigger itself keeps working.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
