CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: action_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.action_status AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'cancelled'
);


--
-- Name: action_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.action_type AS ENUM (
    'one_on_one',
    'workload_adjustment',
    'schedule_change',
    'team_meeting',
    'training',
    'other'
);


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: burnout_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.burnout_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_code text NOT NULL,
    department text NOT NULL,
    branch text NOT NULL,
    risk_score integer NOT NULL,
    reason_category text NOT NULL,
    detected_at timestamp with time zone DEFAULT now() NOT NULL,
    is_resolved boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT burnout_alerts_risk_score_check CHECK (((risk_score >= 0) AND (risk_score <= 100)))
);


--
-- Name: manager_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.manager_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    alert_id uuid NOT NULL,
    manager_name text NOT NULL,
    action_type public.action_type NOT NULL,
    action_description text NOT NULL,
    status public.action_status DEFAULT 'pending'::public.action_status NOT NULL,
    effectiveness_score integer,
    notes text,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT manager_actions_effectiveness_score_check CHECK (((effectiveness_score >= 1) AND (effectiveness_score <= 5)))
);


--
-- Name: burnout_alerts burnout_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.burnout_alerts
    ADD CONSTRAINT burnout_alerts_pkey PRIMARY KEY (id);


--
-- Name: manager_actions manager_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_actions
    ADD CONSTRAINT manager_actions_pkey PRIMARY KEY (id);


--
-- Name: manager_actions update_manager_actions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_manager_actions_updated_at BEFORE UPDATE ON public.manager_actions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: manager_actions manager_actions_alert_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_actions
    ADD CONSTRAINT manager_actions_alert_id_fkey FOREIGN KEY (alert_id) REFERENCES public.burnout_alerts(id) ON DELETE CASCADE;


--
-- Name: burnout_alerts Allow public insert on burnout_alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert on burnout_alerts" ON public.burnout_alerts FOR INSERT WITH CHECK (true);


--
-- Name: manager_actions Allow public insert on manager_actions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert on manager_actions" ON public.manager_actions FOR INSERT WITH CHECK (true);


--
-- Name: burnout_alerts Allow public read on burnout_alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read on burnout_alerts" ON public.burnout_alerts FOR SELECT USING (true);


--
-- Name: manager_actions Allow public read on manager_actions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read on manager_actions" ON public.manager_actions FOR SELECT USING (true);


--
-- Name: burnout_alerts Allow public update on burnout_alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update on burnout_alerts" ON public.burnout_alerts FOR UPDATE USING (true);


--
-- Name: manager_actions Allow public update on manager_actions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update on manager_actions" ON public.manager_actions FOR UPDATE USING (true);


--
-- Name: burnout_alerts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.burnout_alerts ENABLE ROW LEVEL SECURITY;

--
-- Name: manager_actions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.manager_actions ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


