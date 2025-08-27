SELECT current_database(), current_user, now();
SELECT email, role, email_verified, created_at, updated_at
FROM public.users WHERE email = 'deals@dealradarus.com';
SELECT extname FROM pg_extension WHERE extname IN ('citext','pgcrypto') ORDER BY extname;