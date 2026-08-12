CREATE SCHEMA IF NOT EXISTS app_private;
GRANT USAGE ON SCHEMA app_private TO authenticated, service_role;

ALTER FUNCTION public.has_role(uuid, public.app_role) SET SCHEMA app_private;
ALTER FUNCTION app_private.has_role(uuid, public.app_role) SET search_path TO 'public';

REVOKE ALL ON FUNCTION app_private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO authenticated, service_role;