-- Update assign_user_role function to prevent self-assignment of HR role
-- Only existing HR users can assign HR role to others
CREATE OR REPLACE FUNCTION public.assign_user_role(_user_id uuid, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Prevent HR role self-assignment - only existing HR can assign HR role
  IF _role = 'hr' THEN
    -- Check if caller is an existing HR (not the same user being assigned)
    IF auth.uid() = _user_id OR NOT has_role(auth.uid(), 'hr') THEN
      RAISE EXCEPTION 'Only existing HR can assign HR role to other users';
    END IF;
  END IF;
  
  -- Only allow if the user doesn't already have a role
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, _role);
  END IF;
END;
$$;