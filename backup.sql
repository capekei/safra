--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ad_analytics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ad_analytics (
    id integer NOT NULL,
    ad_id integer NOT NULL,
    date date NOT NULL,
    impressions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    province_id integer,
    category_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ad_analytics OWNER TO neondb_owner;

--
-- Name: ad_analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.ad_analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ad_analytics_id_seq OWNER TO neondb_owner;

--
-- Name: ad_analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.ad_analytics_id_seq OWNED BY public.ad_analytics.id;


--
-- Name: ad_placements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ad_placements (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    width integer,
    height integer,
    "position" text NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ad_placements OWNER TO neondb_owner;

--
-- Name: ad_placements_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.ad_placements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ad_placements_id_seq OWNER TO neondb_owner;

--
-- Name: ad_placements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.ad_placements_id_seq OWNED BY public.ad_placements.id;


--
-- Name: admin_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin_sessions (
    id integer NOT NULL,
    admin_user_id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    ip_address text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.admin_sessions OWNER TO neondb_owner;

--
-- Name: admin_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.admin_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_sessions_id_seq OWNER TO neondb_owner;

--
-- Name: admin_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.admin_sessions_id_seq OWNED BY public.admin_sessions.id;


--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin_users (
    id integer NOT NULL,
    email text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    role text DEFAULT 'editor'::text NOT NULL,
    avatar text,
    active boolean DEFAULT true,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    replit_id text
);


ALTER TABLE public.admin_users OWNER TO neondb_owner;

--
-- Name: admin_users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.admin_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_users_id_seq OWNER TO neondb_owner;

--
-- Name: admin_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.admin_users_id_seq OWNED BY public.admin_users.id;


--
-- Name: ads; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ads (
    id integer NOT NULL,
    title text NOT NULL,
    advertiser text NOT NULL,
    image_url text,
    target_url text NOT NULL,
    placement_id integer NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    target_provinces json DEFAULT '[]'::json,
    target_categories json DEFAULT '[]'::json,
    max_impressions integer,
    max_clicks integer,
    impressions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    active boolean DEFAULT true,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ads OWNER TO neondb_owner;

--
-- Name: ads_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.ads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ads_id_seq OWNER TO neondb_owner;

--
-- Name: ads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.ads_id_seq OWNED BY public.ads.id;


--
-- Name: articles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.articles (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text NOT NULL,
    content text NOT NULL,
    featured_image text,
    is_breaking boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    published boolean DEFAULT false,
    published_at timestamp without time zone,
    author_id integer NOT NULL,
    category_id integer NOT NULL,
    likes integer DEFAULT 0,
    comments integer DEFAULT 0,
    views integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    category_ids integer[],
    status text DEFAULT 'draft'::text,
    scheduled_for timestamp without time zone,
    images text[],
    videos text[],
    video_url text,
    province_id integer
);


ALTER TABLE public.articles OWNER TO neondb_owner;

--
-- Name: articles_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.articles_id_seq OWNER TO neondb_owner;

--
-- Name: articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.articles_id_seq OWNED BY public.articles.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    admin_user_id integer NOT NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id integer NOT NULL,
    changes json,
    ip_address text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO neondb_owner;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO neondb_owner;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: authors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.authors (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    bio text,
    avatar text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.authors OWNER TO neondb_owner;

--
-- Name: authors_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.authors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.authors_id_seq OWNER TO neondb_owner;

--
-- Name: authors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.authors_id_seq OWNED BY public.authors.id;


--
-- Name: business_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.business_categories (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    icon text NOT NULL
);


ALTER TABLE public.business_categories OWNER TO neondb_owner;

--
-- Name: business_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.business_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.business_categories_id_seq OWNER TO neondb_owner;

--
-- Name: business_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.business_categories_id_seq OWNED BY public.business_categories.id;


--
-- Name: businesses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.businesses (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    address text,
    phone text,
    whatsapp text,
    email text,
    website text,
    images json DEFAULT '[]'::json,
    price_range integer DEFAULT 1,
    category_id integer NOT NULL,
    province_id integer,
    municipality text,
    average_rating numeric(2,1) DEFAULT 0.0,
    total_reviews integer DEFAULT 0,
    verified boolean DEFAULT false,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.businesses OWNER TO neondb_owner;

--
-- Name: businesses_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.businesses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.businesses_id_seq OWNER TO neondb_owner;

--
-- Name: businesses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.businesses_id_seq OWNED BY public.businesses.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    icon text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.categories OWNER TO neondb_owner;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO neondb_owner;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: classified_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.classified_categories (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    icon text NOT NULL
);


ALTER TABLE public.classified_categories OWNER TO neondb_owner;

--
-- Name: classified_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.classified_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.classified_categories_id_seq OWNER TO neondb_owner;

--
-- Name: classified_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.classified_categories_id_seq OWNED BY public.classified_categories.id;


--
-- Name: classifieds; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.classifieds (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    price numeric(10,2),
    currency text DEFAULT 'DOP'::text,
    images json DEFAULT '[]'::json,
    contact_name text NOT NULL,
    contact_phone text NOT NULL,
    contact_whatsapp text,
    contact_email text,
    province_id integer,
    municipality text,
    category_id integer NOT NULL,
    active boolean DEFAULT true,
    featured boolean DEFAULT false,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.classifieds OWNER TO neondb_owner;

--
-- Name: classifieds_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.classifieds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.classifieds_id_seq OWNER TO neondb_owner;

--
-- Name: classifieds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.classifieds_id_seq OWNED BY public.classifieds.id;


--
-- Name: moderation_queue; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.moderation_queue (
    id integer NOT NULL,
    entity_type text NOT NULL,
    entity_id integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    submitted_by text,
    moderated_by integer,
    moderation_notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    moderated_at timestamp without time zone
);


ALTER TABLE public.moderation_queue OWNER TO neondb_owner;

--
-- Name: moderation_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.moderation_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.moderation_queue_id_seq OWNER TO neondb_owner;

--
-- Name: moderation_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.moderation_queue_id_seq OWNED BY public.moderation_queue.id;


--
-- Name: provinces; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.provinces (
    id integer NOT NULL,
    name text NOT NULL,
    code text NOT NULL
);


ALTER TABLE public.provinces OWNER TO neondb_owner;

--
-- Name: provinces_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.provinces_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.provinces_id_seq OWNER TO neondb_owner;

--
-- Name: provinces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.provinces_id_seq OWNED BY public.provinces.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    business_id integer NOT NULL,
    reviewer_name text NOT NULL,
    reviewer_email text,
    rating integer NOT NULL,
    title text,
    content text NOT NULL,
    images json DEFAULT '[]'::json,
    helpful integer DEFAULT 0,
    approved boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reviews OWNER TO neondb_owner;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO neondb_owner;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role character varying DEFAULT 'user'::character varying
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: ad_analytics id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ad_analytics ALTER COLUMN id SET DEFAULT nextval('public.ad_analytics_id_seq'::regclass);


--
-- Name: ad_placements id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ad_placements ALTER COLUMN id SET DEFAULT nextval('public.ad_placements_id_seq'::regclass);


--
-- Name: admin_sessions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_sessions ALTER COLUMN id SET DEFAULT nextval('public.admin_sessions_id_seq'::regclass);


--
-- Name: admin_users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_users ALTER COLUMN id SET DEFAULT nextval('public.admin_users_id_seq'::regclass);


--
-- Name: ads id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ads ALTER COLUMN id SET DEFAULT nextval('public.ads_id_seq'::regclass);


--
-- Name: articles id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.articles ALTER COLUMN id SET DEFAULT nextval('public.articles_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: authors id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.authors ALTER COLUMN id SET DEFAULT nextval('public.authors_id_seq'::regclass);


--
-- Name: business_categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.business_categories ALTER COLUMN id SET DEFAULT nextval('public.business_categories_id_seq'::regclass);


--
-- Name: businesses id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.businesses ALTER COLUMN id SET DEFAULT nextval('public.businesses_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: classified_categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.classified_categories ALTER COLUMN id SET DEFAULT nextval('public.classified_categories_id_seq'::regclass);


--
-- Name: classifieds id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.classifieds ALTER COLUMN id SET DEFAULT nextval('public.classifieds_id_seq'::regclass);


--
-- Name: moderation_queue id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.moderation_queue ALTER COLUMN id SET DEFAULT nextval('public.moderation_queue_id_seq'::regclass);


--
-- Name: provinces id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.provinces ALTER COLUMN id SET DEFAULT nextval('public.provinces_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: ad_analytics; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ad_analytics (id, ad_id, date, impressions, clicks, province_id, category_id, created_at) FROM stdin;
\.


--
-- Data for Name: ad_placements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ad_placements (id, name, slug, description, width, height, "position", active, created_at) FROM stdin;
2	Banner Principal	banner-principal	Banner horizontal en la parte superior de la página principal	728	90	home-top	t	2025-07-22 01:41:52.39352
3	Rectángulo Mediano	rectangulo-mediano	Rectángulo mediano en la barra lateral	300	250	sidebar-top	t	2025-07-22 01:41:52.39352
4	Banner Móvil	banner-movil	Banner optimizado para dispositivos móviles	320	50	mobile-banner	t	2025-07-22 01:41:52.39352
5	Banner Artículo	banner-articulo	Banner dentro del contenido del artículo	728	90	article-middle	t	2025-07-22 01:41:52.39352
6	Cuadrado Pequeño	cuadrado-pequeno	Cuadrado en la parte inferior de la barra lateral	250	250	sidebar-bottom	t	2025-07-22 01:41:52.39352
\.


--
-- Data for Name: admin_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.admin_sessions (id, admin_user_id, token, expires_at, ip_address, user_agent, created_at) FROM stdin;
1	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc1MzE0MTE1NywiZXhwIjoxNzUzMjI3NTU3fQ.bZ_lTYUTZcgy870WCjPiYN6zNArRqkHXbLPhlhemBbQ	2025-07-22 23:39:17.245	172.31.128.85	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-21 23:39:17.282863
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.admin_users (id, email, username, password, first_name, last_name, role, avatar, active, last_login, created_at, updated_at, replit_id) FROM stdin;
1	admin@safrareport.com	admin	$2b$10$BmyFCdyZ/do1lccMtyVemu6I8S7o9mrWAZOLK8WXuegoqic7tlGZa	Super	Admin	admin	\N	t	2025-07-21 23:39:17.325	2025-07-21 23:27:18.6419	2025-07-21 23:27:18.6419	\N
\.


--
-- Data for Name: ads; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ads (id, title, advertiser, image_url, target_url, placement_id, start_date, end_date, target_provinces, target_categories, max_impressions, max_clicks, impressions, clicks, active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.articles (id, title, slug, excerpt, content, featured_image, is_breaking, is_featured, published, published_at, author_id, category_id, likes, comments, views, created_at, updated_at, category_ids, status, scheduled_for, images, videos, video_url, province_id) FROM stdin;
4	OpenAI y Oracle amplían “Stargate” con 4.5 GW más de potencia en EE.UU.	dolar-estadounidense-maximo-peso-dominicano	OpenAI y Oracle anunciaron una expansión del proyecto Stargate con 4.5 GW adicionales de centros de datos en EE.UU., elevando la capacidad total a más de 5 GW, para responder a la demanda masiva de IA.	<p><strong>Santo Domingo, 22 de julio de 2025</strong> – OpenAI y Oracle reforzaron hoy su alianza dentro del proyecto <strong>Stargate</strong>, anunciando la construcción conjunta de <strong>4.5 GW adicionales</strong> en centros de datos para inteligencia artificial en Estados Unidos. Esta expansión lleva la capacidad total en desarrollo a <strong>más de 5 GW</strong>, alojando más de <strong>2 millones de chips especializados</strong> de IA <a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.reuters.com/business/openai-oracle-deepen-ai-data-center-push-with-45-gigawatt-stargate-expansion-2025-07-22/?utm_source=chatgpt.com">RCR Wireless News+14Reuters+14The Times of India+14</a>.</p><h3>🔌 ¿Por qué tanto poder?</h3><p>Según Deloitte, la demanda de energía por centros de datos de IA en EE.UU. pasaría de <strong>4 GW en 2024</strong> a <strong>123 GW en 2035</strong>, un crecimiento explosivo impulsado por modelos de machine learning y tareas de entrenamiento e inferencia avanzadas <a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://en.wikipedia.org/wiki/Artificial_intelligence?utm_source=chatgpt.com">Wikipedia</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://apnews.com/article/86f56ec2bacef971e76a487ff0886074?utm_source=chatgpt.com">AP News</a>.</p><h3>📍 En qué estado está el proyecto</h3><ul><li><p>El primer campus, <strong>en Abilene (Texas)</strong>, está operativo con racks NVIDIA GB200 desde junio y es usado por OpenAI en sus fases iniciales de entrenamiento <a target="_blank" rel="noopener noreferrer nofollow" href="http://Bloomberg.com">Bloomberg.com</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.datacenterdynamics.com/en/news/oracle-to-spend-40bn-on-nvidia-chips-for-openai-texas-data-center/?utm_source=chatgpt.com">+6Data Center Dynamics+6Data Center Dynamics+6</a>.</p></li><li><p>Oracle y OpenAI firmaron un acuerdo para <strong>4.5 GW adicionales</strong>, parte de la meta total de 10 GW, representando hasta USD 500 mil millones de inversión <a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.reuters.com/business/openai-oracle-deepen-ai-data-center-push-with-45-gigawatt-stargate-expansion-2025-07-22/?utm_source=chatgpt.com">Omni+15Reuters+15Outlook Business+15</a>.</p></li><li><p>Oracle está comprometida a gastar aprox. USD 40 mil millones en chips NVIDIA para este campus texano <a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.datacenterdynamics.com/en/news/oracle-to-spend-40bn-on-nvidia-chips-for-openai-texas-data-center/?utm_source=chatgpt.com">Wikipedia+3Data Center Dynamics+3Artificial Intelligence News+3</a>.</p></li></ul><h3>🌐 Contexto geopolítico y estratégico</h3><p>El impulso detrás del proyecto busca mantener la <strong>ventaja competitiva de EE.UU. frente a China</strong>, promoviendo una inteligencia artificial abierta, lo que OpenAI llama “democratic AI versus autocratic AI” <a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.reuters.com/business/openai-oracle-deepen-ai-data-center-push-with-45-gigawatt-stargate-expansion-2025-07-22/?utm_source=chatgpt.com">Reuters</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://openai.com/global-affairs/openai-for-countries/?utm_source=chatgpt.com">OpenAI</a>.</p><h3>⚠️ Riesgos y desafíos</h3><ul><li><p>Alcance millonario de inversión ya genera dudas entre analistas sobre su viabilidad <a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.reuters.com/business/openai-oracle-deepen-ai-data-center-push-with-45-gigawatt-stargate-expansion-2025-07-22/?utm_source=chatgpt.com">Reuters</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.wsj.com/tech/ai/softbank-openai-a3dc57b4?utm_source=chatgpt.com">The Wall Street Journal</a>.</p></li><li><p>Aumentar la infraestructura IA implica también mayores requerimientos energéticos, lo que podría presionar sistemas de generación y afectar medioambientes locales <a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.itpro.com/infrastructure/data-centres/meta-working-on-a-5gw-data-center-to-supercharge-ai-infrastructure-and-mark-zuckerberg-says-one-cluster-alone-covers-a-significant-part-of-the-footprint-of-manhattan?utm_source=chatgpt.com">IT Pro</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://apnews.com/article/86f56ec2bacef971e76a487ff0886074?utm_source=chatgpt.com">AP News</a>.</p></li></ul><hr><h3>🌟 En resumen</h3><p>Con la nueva adición de <strong>4.5 GW</strong>, Stargate refuerza su liderazgo en infraestructura de IA. El proyecto, mucho más que un plan de expansión física, representa una apuesta estratégica a largo plazo por parte de EE.UU. frente a sus rivales globales. Sin duda, una de las inversiones más ambiciosas en tecnología de los últimos años.</p>	https://www.reuters.com/resizer/v2/ABYYK46YXVPTVJV657NMYNWGNY.jpg?auth=0eba8eea7c20d5682c8dc491bf4bfaabd3a01e575ba04af8977dccd0c2ce1e6d&width=1920&quality=80	t	f	t	2025-07-22 19:02:23.762	2	1	67	18	1560	2025-07-21 22:06:19.990881	2025-07-22 19:02:23.762	{3}	published	\N	\N	\N	\N	33
2	El impacto del tarifazo de Trump sobre el comercio entre EE.UU. y China	tigres-licey-ganan-partido-serie-caribe	En mayo de 2025, los aranceles del 145 % impuestos por Trump provocaron una caída del 28,5 % en las importaciones estadounidenses por vía marítima desde China. Con ambos países representando casi la mitad del PIB y de la manufactura mundial, las próximas negociaciones serán clave para la estabilidad económica global.	<p><strong>Santo Domingo, 22 de julio de 2025</strong> – Las repercusiones del reciente incremento de los aranceles del 145% sobre las importaciones desde China entraron con fuerza en mayo: las importaciones marítimas cayeron un 28.5% en comparación con el mismo mes del año anterior —la mayor contracción desde la pandemia—, lanzando señales de alerta a líderes globales <a target="_blank" rel="noopener noreferrer nofollow" href="http://Bloomberg.com">Bloomberg.com</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.weforum.org/stories/2025/06/us-china-deal-and-other-international-trade-stories-to-know-this-month/?utm_source=chatgpt.com">+15World Economic Forum+15Al Jazeera+15</a>.</p><h3>📊 Dos potencias, un gran pulso</h3><p>Las economías de Estados Unidos y China representan aproximadamente el <strong>43% del PIB global</strong> y casi el <strong>48% de la producción manufacturera mundial</strong>. Por ello, el resultado de las conversaciones programadas para la próxima semana (previas al 12 de agosto) puede determinar el rumbo del comercio mundial <a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.weforum.org/stories/2025/06/us-china-deal-and-other-international-trade-stories-to-know-this-month/?utm_source=chatgpt.com">World Economic Forum</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://en.wikipedia.org/wiki/China%E2%80%93United_States_trade_war?utm_source=chatgpt.com">Wikipedia</a>.</p><h3>🤝 Primeras señales desde China</h3><p>En mayo, el Ministerio de Comercio chino condicionó las negociaciones a que EE.UU. actúe con sinceridad, incluyendo el desmantelamiento de sus aranceles adicionales “erróneos y unilaterales” <a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://finance.yahoo.com/news/live/trump-tariffs-live-updates-trump-hints-at-pharma-duties-no-plans-to-talk-to-chinas-xi-191201388.html?utm_source=chatgpt.com">Yahoo Finance+9Yahoo Finance+</a><a target="_blank" rel="noopener noreferrer nofollow" href="http://9Bloomberg.com">9Bloomberg.com</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://finance.yahoo.com/news/live/trump-tariffs-live-updates-trump-hints-at-pharma-duties-no-plans-to-talk-to-chinas-xi-191201388.html?utm_source=chatgpt.com">+9</a>.</p><h3>⚠️ Riesgos de una escalada</h3><ul><li><p>La contracción de las importaciones podría encarecer insumos para industrias clave en ambos países.</p></li><li><p>El formidable peso económico bilateral multiplica los efectos globales de una ruptura o acuerdo falto de ambición.</p></li></ul><hr><h3>🔍 En resumen</h3><p>Las cifras de mayo muestran el alcance real del tarifazo: un desplome en las importaciones marítimas que contradice la promesa de corte comercial. Con la economía mundial en vilo, las negociaciones que se avecinan serán decisivas. ¿Habrá gesto de sinceridad desde Washington? China monitorea expectante.</p>	https://www.reuters.com/resizer/v2/BFANWX7Y2ZPH5LJD7WIPH7OEE4.jpg?auth=2d24ae0854c1a5b708ca7bdc364d8b9a5ffccef2bbdfe7190ed99cf5e2315ef1&width=1920&quality=80	t	t	t	2025-07-22 19:05:04.507	3	1	89	23	2100	2025-07-21 22:06:19.990881	2025-07-22 19:05:04.507	{3}	published	\N	\N	\N	\N	33
3	Coca-Cola lanzará versión con azúcar de caña, pero expertos señalan que el cambio no mejora la salud	nueva-aplicacion-dominicana-revoluciona-comercio-electronico	Coca-Cola introducirá una versión de su bebida con azúcar de caña este otoño en EE.UU. Sin embargo, nutricionistas advierten que esta opción ofrece los mismos efectos metabólicos que el jarabe de maíz, mientras que la industria del maíz alerta sobre pérdidas de miles de empleos si se elimina totalmente el HFCS.	<p><strong>Santo Domingo, 22 de julio de 2025</strong> – Coca-Cola confirmó que lanzará en otoño una nueva bebida endulzada con azúcar de caña en el mercado estadounidense. La compañía aclaró que esta versión será un complemento y no reemplazará la fórmula actual que usa jarabe de maíz.</p><h3>¿Mejora real para la salud?</h3><p>Según el Dr. <strong>Dariush Mozaffarian</strong>, director del Food Is Medicine Institute en Tufts University, <strong>ambos endulzantes—azúcar de caña y jarabe de maíz—contienen alrededor de 50% fructosa y 50% glucosa</strong>, por lo que tienen efectos metabólicos casi idénticos. <a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://parade.com/food/coca-cola-to-launch-u-s-cane-sugar-soda-this-fall-but-its-not-replacing-corn-syrup?utm_source=chatgpt.com">The Times+13Parade+13New York Post+13</a></p><h3>Riesgos para la industria del maíz</h3><p>La Corn Refiners Association advirtió que dejar el HFCS por completo podría:</p><ul><li><p>Costar <strong>miles de empleos</strong> en la industria de refinación de maíz,</p></li><li><p>Reducir ingresos de agricultores de maíz,</p></li><li><p>Incrementar las importaciones de azúcar sin ofrecer beneficios nutricionales. <a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://corn.org/cra-comment-potential-reformulations/?utm_source=chatgpt.com">Barron's+15Corn Refiners Association+15Axios+15</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.foodandwine.com/trump-coca-cola-cane-sugar-claims-11774173?utm_source=chatgpt.com">Food &amp; Wine</a></p></li></ul><p>Un informe de Reuters estimó que eliminar el jarabe de maíz causaría pérdidas de hasta <strong>5.1 mil millones USD</strong> en ingresos agrícolas. <a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.reuters.com/world/us/cokes-shift-cane-sugar-would-be-expensive-hurt-us-farmers-2025-07-17/?utm_source=chatgpt.com">Reuters+1Fox Business+1</a></p><h3>La posición de Coca-Cola</h3><p>La compañía mantiene que la nueva versión con azúcar de caña responde a tendencias de consumo más saludables y diversificación de productos. No confirma planes de eliminar el HFCS de su línea principal. <a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://people.com/coca-cola-confirms-cane-sugar-coke-after-trump-announcement-11776608?utm_source=chatgpt.com">The Independent+</a><a target="_blank" rel="noopener noreferrer nofollow" href="http://15People.com">15People.com</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://people.com/coca-cola-confirms-cane-sugar-coke-after-trump-announcement-11776608?utm_source=chatgpt.com">+15Barron's+15</a></p><hr><h3>🌟 En resumen</h3><ul><li><p>Coca-Cola lanzará una versión con azúcar de caña en otoño 2025, manteniendo ambas versiones en el mercado.</p></li><li><p>Expertos en salud explican que no hay diferencias metabólicas significativas entre ambos endulzantes.</p></li><li><p>La industria del maíz advierte de un impacto económico severo si se reemplaza totalmente el HFCS.</p></li></ul><hr><h3>🔧 Recomendación rápida</h3><p>Para el consumidor preocupado por salud, el verdadero cambio no está en el tipo de azúcar, sino en reducir el consumo total de bebidas azucaradas.</p>	https://i.abcnewsfe.com/a/77e834fb-35ed-49b0-a7a2-d47887c75c4d/coca-cola-gty-jef-250722_1753186075956_hpMain.jpg?w=1500	f	f	t	2025-07-22 19:08:03.837	3	1	34	8	892	2025-07-21 22:06:19.990881	2025-07-22 19:08:03.837	{3,10}	published	\N	\N	\N	\N	33
10	Rich Hill, a los 45, emula hazaña de Nolan Ryan en Triple‑A	rich-hill-a-los-45-emula-hazana-de-nolan-ryan-en-triple-a	A sus 45 años, Rich Hill se convirtió en el primer lanzador de esa edad en registrar 10 ponches en un juego profesional desde Nolan Ryan en 1992, durante una actuación estelar en triple‑A Omaha.	<p><strong>Santo Domingo, 24 de julio de 2025</strong> – El veterano <strong>Rich Hill</strong>, que milita en Triple‑A Omaha con los Royals, demostró que la edad no es barrera el pasado 13 de julio: en cinco entradas contra Toledo, ponchó a <strong>10 bateadores</strong>, convirtiéndose en el primer lanzador de <strong>45 años</strong> en lograr dobles dígitos de ponches en un juego profesional desde <strong>Nolan Ryan</strong>, quien lo logró el <strong>6 de agosto de 1992</strong> <a target="_blank" rel="noopener noreferrer nofollow" href="http://NESN.com">NESN.com</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.wbsc.org/en/news/wbsc-premier12-star-rich-hill-strikes-out-10-at-triple-a-at-age-45?utm_source=chatgpt.com">+</a><a target="_blank" rel="noopener noreferrer nofollow" href="http://6wbsc.org">6wbsc.org</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.wbsc.org/en/news/wbsc-premier12-star-rich-hill-strikes-out-10-at-triple-a-at-age-45?utm_source=chatgpt.com">+6New York Post+6</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.mlb.com/news/royals-rich-hill-10-strikeouts-at-triple-a-first-since-nolan-ryan?utm_source=chatgpt.com">Yahoo Sports+</a><a target="_blank" rel="noopener noreferrer nofollow" href="http://15MLB.com">15MLB.com</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.mlb.com/news/royals-rich-hill-10-strikeouts-at-triple-a-first-since-nolan-ryan?utm_source=chatgpt.com">+15SI+15</a>.</p><p>Con exactamente <strong>45 años, 4 meses y 2 días</strong>, Hill superó al histórico Ryan, que tenía <strong>45 años, 6 meses y 6 días</strong> al lograrlo <a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.si.com/onsi/minor-league-baseball/news/at-45-and-pitching-in-triple-a-rich-hill-shares-baseball-history-with-nolan-ryan-01k086457bbh?utm_source=chatgpt.com">SI</a>.</p><h3>📊 Rendimiento en el circuito menor</h3><p>Antes de su llamado a las Grandes Ligas con Kansas City, Hill acumuló balance de <strong>4‑4 con efectividad de 5.22</strong> en 11 aperturas en ligas menores, 9 de ellas para Omaha. Ponchó <strong>61 bateadores en 50 entradas</strong>, mientras mantuvo efectividad de dos carreras o menos en seis de esas salidas <a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.mlb.com/news/rich-hill-royals-call-up?utm_source=chatgpt.com">SI+</a><a target="_blank" rel="noopener noreferrer nofollow" href="http://9MLB.com">9MLB.com</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.mlb.com/news/rich-hill-royals-call-up?utm_source=chatgpt.com">+9https://</a><a target="_blank" rel="noopener noreferrer nofollow" href="http://www.kwch.com">www.kwch.com</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.mlb.com/news/rich-hill-royals-call-up?utm_source=chatgpt.com">+9</a>.</p><p>El mánager <strong>Matt Quatraro</strong> valoró su desempeño destacando que “lanza muchas strikes, es muy atlético, mantiene buen estado físico, se mueve bien en la lomita y varía los ángulos de su brazo” <a target="_blank" rel="noopener noreferrer nofollow" href="http://MLB.com">MLB.com</a>.</p><hr><h3>🧭 ¿Qué sigue para Hill?</h3><ul><li><p>Se prevé su debut en la MLB con los Royals para esta semana, lo que sería su <strong>21ª temporada</strong> en las Grandes Ligas, uniéndose al récord de Edwin Jackson con 14 franquicias <a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.reuters.com/sports/reports-royals-call-up-lhp-rich-hill-45-21st-season-2025-07-21/?utm_source=chatgpt.com">New York Post+3Reuters+3New York Post+3</a>.</p></li><li><p>Su edad récord lo posiciona como el <strong>jugador activo más veterano</strong>, superando en edad al lanzador actual Justin Verlander (42), y acercándose a la marca de Jamie Moyer, que jugó hasta los 49 <a target="_blank" rel="noopener noreferrer nofollow" href="http://CBSSports.com">CBSSports.com</a>.</p></li></ul><hr><h3>🌟 En resumen</h3><p>Rich Hill vuelve a demostrar que la experiencia pesa: su actuación en Triple‑A lo coloca en una elite histórica junto a Nolan Ryan, y lo proyecta como una opción real para reforzar la rotación de Kansas City en su 21ª temporada en las Grandes Ligas.</p>	https://www.masslive.com/resizer/v2/M2FOADJLQJEGBIJNMKKRKSEA7M.jpg?auth=e8bab4a5944b7f81ecfcb3f25665701197ed747e95ef7f527549057dbee7bb55&width=1280&quality=90	f	f	t	2025-07-22 19:52:25.735	2	1	0	0	0	2025-07-22 19:52:26.256895	2025-07-22 19:52:26.256895	{4}	published	\N	\N	\N	\N	33
1	Occidente responde: rechazo a tácticas híbridas rusas se intensifica	gobierno-dominicano-nuevas-politicas-desarrollo-economico	La OTAN y socios occidentales condenan el tono elevado de los ataques híbridos rusos, que se han multiplicado en el último año. Anuncian una respuesta coordinada y legal, que llegará “en el momento y la forma” que consideren oportunos.	<p><strong>Santo Domingo, 18 de julio de 2025</strong> – La OTAN y varios aliados han emitido una declaración conjunta para denunciar el alarmante aumento de las <strong>operaciones híbridas rusas</strong>, que combinan sabotajes, ciberataques y guerra electrónica.</p><h3>📈 Un fenómeno en rápida expansión</h3><p>Durante 2023 y 2024, estos ataques <strong>casi se triplicaron</strong>, según fuentes de seguridad. Los blancos incluyen:</p><ul><li><p>Infraestructuras críticas como transporte, energía y redes de comunicación.</p></li><li><p>Instalaciones gubernamentales y de logística.</p></li><li><p>Redes civiles, mediante explosivos, intrusiones cibernéticas y técnicas electrónicas de interferencia.</p></li></ul><h3>🧭 Respuesta estratégica coordinada</h3><p>La OTAN advirtió que responderá <strong>“cuando y como lo consideremos oportuno”</strong>, siempre respetando el derecho internacional y en alianza con la Unión Europea y otros aliados. La medida subraya el compromiso colectivo de defenderse ante esta modalidad de agresión.</p><h3>🔍 Por qué esto importa</h3><p>Las operaciones híbridas presentan un desafío complejo: son difíciles de atribuir, disruptivas y diluyen la línea entre conflicto convencional y ciberguerra. A diferencia de las agresiones tradicionales, ofrecen capas de plausible deniability en manos de actores estatales.</p><hr><h3>⚠️ ¿Qué sigue?</h3><ul><li><p><strong>Vigilancia reforzada</strong>, con agencias de defensa y seguridad alertas.</p></li><li><p>Posibles <strong>respuestas cibernéticas y sanciones selectivas</strong>.</p></li><li><p>Cooperación fortificada entre OTAN y la UE para proteger la infraestructura común.</p></li></ul><p>Este paso marca un endurecimiento de la postura occidental frente a tácticas de guerra encubierta y destaca la prioridad de blindar sistemas esenciales en un mundo interconectado.</p><hr><p></p>	https://news.northeastern.edu/wp-content/uploads/2025/03/Elon1400.jpg	t	t	t	2025-07-22 16:55:49.013	1	2	45	12	1272	2025-07-21 22:06:19.990881	2025-07-22 16:55:49.013	{2}	published	\N	\N	\N	\N	33
11	Zverev y Fritz toman el protagonismo en Toronto, pero las ausencias exponen el calendario agotador	zverev-y-fritz-toman-el-protagonismo-en-toronto-pero-las-ausencias-exponen-el-calendario-agotador	Con Novak Djokovic, Jannik Sinner y Carlos Alcaraz fuera del Canadian Open, Alexander Zverev y Taylor Fritz se perfilan como favoritos. Sin embargo, el éxodo de estrellas ha reavivado críticas sobre el calendario comprimido del ATP Tour.	<p><strong>Santo Domingo, 25 de julio de 2025</strong> – La ausencia de los principales cabezas de serie como Djokovic, Sinner y Alcaraz deja a los jugadores <strong>n.º 3 Alexander Zverev</strong> y <strong>n.º 4 Taylor Fritz</strong> como las figuras naturales para liderar el cuadro del Canadian Open. Sin embargo, más allá de los focos, este éxodo de estrellas pone en el centro una discusión urgente sobre el calendario del ATP Tour.</p><h3>🗓️ Demasiado, demasiado pronto</h3><p>El torneo canadiense se ha expandido a <strong>12 días y 96 jugadores</strong>, pero esta ampliación ha tenido sus consecuencias. El periodista Matt Roberts, en The Tennis Podcast, advirtió que con apenas <strong>14 días entre el final de Wimbledon y el inicio en Canadá</strong>, "algo tiene que ceder, y verdaderamente el deporte debería revisar su calendario" <a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.reddit.com/r/tennis/comments/1m5phtw/alcaraz_still_didnt_make_the_decision_about/?utm_source=chatgpt.com">Reddit</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://tennishead.net/atp-tour-told-their-schedule-doesnt-work-and-must-change-after-carlos-alcaraz-and-novak-djokovic-pull-out-of-toronto/?utm_source=chatgpt.com">EssentiallySports+10Tennishead+10Global Player+10</a>.</p><h3>🔊 Atención por parte de Corretja</h3><p>El analista español <strong>Álex Corretja</strong> hizo pública su preocupación: aconsejó a <strong>Carlos Alcaraz</strong> comprender el costo físico y mental del calendario y <strong>saltarse Toronto</strong>. Su recomendación se basó en que este parón estratégico le permitiría llegar con mejor forma al <strong>Masters de Cincinnati</strong> (8 al 18 de agosto) <a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://cadenaser.com/nacional/2025/07/14/el-consejo-de-alex-corretja-a-carlos-alcaraz-tras-su-derrota-en-wimbledon-deberia-plantearselo-seriamente-cadena-ser/?utm_source=chatgpt.com">EssentiallySports+3Cadena SER+3Diario AS+3</a>.</p><h3>🎯 Lo que viene y lo que importa</h3><ul><li><p><strong>Canadá</strong>, del 27 de julio al 7 de agosto, sin cuatro de los seis mejores del mundo.</p></li><li><p><strong>Cincinnati</strong> comenzará el 8 de agosto, apenas 24 horas después de concluir Toronto.</p></li><li><p><strong>US Open</strong>, en pista rápida, del 26 de agosto al 8 de septiembre, dejará poco margen para descansos.</p></li></ul><hr><h3>⚠️ Conclusión</h3><p>El éxodo de estrellas al Canadian Open revela un problema estructural: la planificación del ATP sigue exponiendo a los jugadores a un desgaste extremo. Dos semanas entre torneos grandes no dan espacio para recuperarse y podrían mermar su rendimiento en momentos clave del año. ¿Llegarán cambios reales para proteger su salud y elevar la calidad de competencia?</p>	https://media.gettyimages.com/id/2225321951/es/foto/london-england-jannik-sinner-1-and-carlos-alcaraz-2-with-their-trophies-after-the.jpg?s=1024x1024&w=gi&k=20&c=bdqhnQtvvf10o7zHp_iNnRKF5R4JWhAmDfMjUQAPC1c=	f	f	t	2025-07-22 19:54:21.25	3	1	0	0	0	2025-07-22 19:54:23.832149	2025-07-22 19:54:23.832149	{4}	published	\N	\N	\N	\N	33
7	Ozzy Osbourne, el “Príncipe de las Tinieblas”, fallece a los 76 años	ozzy-osbourne-el-principe-de-las-tinieblas-fallece-a-los-76-anos	John Michael “Ozzy” Osbourne, voz icónica de Black Sabbath y pionero del heavy metal, murió hoy a los 76 años. Su legado abarca desde clásicos metaleros hasta su rol en televisión, dejando una marca imborrable en el rock y la cultura pop.\r\n\r\n	<p><strong>Santo Domingo, 22 de julio de 2025</strong> – Ozzy Osbourne, nacido en Birmingham en 1948, murió hoy a los 76 años, rodeado de su familia tras ofrecer su emotiva despedida en Villa Park. Su carrera fue una montaña rusa de éxitos, escándalos y reinvenciones, convirtiéndose en un ícono global del rock y la televisión.</p><h3>🎤 Trayectoria y legado</h3><ul><li><p>En <strong>1968</strong>, fundó <strong>Black Sabbath</strong>, banda que definió el sonido del heavy metal con álbumes como <em>Paranoid</em>, <em>Iron Man</em> y <em>War Pigs</em>.</p></li><li><p>Tras su salida en <strong>1979</strong>, su carrera como solista le abrió nuevas fronteras con éxitos como “Crazy Train”, “Mr. Crowley” y giras como <em>Ozzyfest</em>.</p></li></ul><h3>🏆 Récords y reconocimientos</h3><ul><li><p>Vendió más de <strong>100 millones de discos</strong>, tanto con la banda como en solitario.</p></li><li><p>Fue incluido en el <strong>Rock &amp; Roll Hall of Fame</strong> en 2006 (con Black Sabbath) y nuevamente en 2024 como solista.</p></li><li><p>Reconocido por su voz oscura, presencia magnética y una personalidad tan única como controvertida.</p></li></ul><h3>🎵 Su despedida en casa</h3><p>El <strong>5 de julio de 2025</strong>, regresó a su ciudad natal para el concierto <em>Back to the Beginning</em> junto a sus compañeros originales. La emotiva performance, con Ozzy cantando desde un trono por su condición de salud, marcó el cierre de su carrera en los escenarios.</p><h3>💔 Salud y vida personal</h3><p>En sus últimos años enfrentó un diagnóstico de <strong>Parkinson</strong> (2020) y secuelas de un accidente previo que afectaron su movilidad. A pesar de ello, siguió conectando con su audiencia hasta el final. Deja esposa (<strong>Sharon</strong>) e hijos (<strong>Aimee, Kelly, Jack, Jessica y Louis</strong>).</p><h3>📺 Leyenda más allá de la música</h3><p>Se convirtió en una figura mediática en los 2000 gracias a <strong>The Osbournes</strong> (MTV), que mostró su lado familiar y ayudó a popularizar el formato reality.</p><hr><h3>🎯 Resumen</h3><p>Ozzy Osbourne fue mucho más que una voz poderosa: fue una fuerza cultural, un innovador del heavy metal y una figura popular que rompió esquemas. Su influencia continuará viva en la música, la televisión y la memoria colectiva.</p>	https://i.guim.co.uk/img/media/193a4c25d6a8e9d8223d9de703fb9ec365e8db19/0_30_7087_4252/master/7087.jpg?width=465&dpr=1&s=none&crop=none	t	t	t	2025-07-22 19:41:26.391	1	1	0	0	7	2025-07-22 19:30:21.1207	2025-07-22 19:41:26.391	{1}	published	\N	\N	\N	\N	\N
8	SoundOn se revela como puerta de entrada a la música IA unilateral	soundon-se-revela-como-puerta-de-entrada-a-la-musica-ia-unilateral	El servicio de distribución de TikTok, SoundOn, está siendo señalado como responsable de permitir que canciones generadas por IA aparezcan en los perfiles oficiales de artistas reales. El incidente con Blaze Foley y la demanda de un músico independiente ponen en alerta a la industria creativa.	<p><strong>Santo Domingo, 25 de julio de 2025</strong> – SoundOn, la plataforma de distribución musical de TikTok, se ha convertido en una <strong>vulnerabilidad en el proceso de publicación digital</strong>. Sus términos legales autorizan explícitamente el entrenamiento de IA con el contenido distribuido, lo que ha facilitado el ingreso de canciones falsificadas en catálogos oficiales.</p><h3>👻 El caso Blaze Foley</h3><p>El problema se hizo evidente cuando apareció un tema titulado <strong>“Together”</strong> bajo el perfil del desaparecido músico <strong>Blaze Foley</strong> en Spotify, sin autorización alguna. El track, claramente generado por IA, fue distribuido a través de SoundOn antes de ser detectado y retirado de la plataforma <a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.tiktok.com/%40seansvv/video/7078019275398810926?lang=en&amp;utm_source=chatgpt.com">TikTok</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.hotpress.com/music/spotify-removes-ai-generated-music-from-deceased-artists-profiles-23098584?utm_source=chatgpt.com">Reddit+15Hotpress+15TikTok+15</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.vice.com/en/article/ai-generated-songs-have-been-uploaded-to-dead-artists-pages-on-spotify/?utm_source=chatgpt.com">TikTok+10VICE+</a><a target="_blank" rel="noopener noreferrer nofollow" href="http://10entertainment.slashdot.org">10entertainment.slashdot.org</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://www.vice.com/en/article/ai-generated-songs-have-been-uploaded-to-dead-artists-pages-on-spotify/?utm_source=chatgpt.com">+10</a>.</p><h3>📢 La voz de los creadores</h3><p>El caso provocó alarma dentro del sector. El músico independiente <strong>Anthony Justice</strong> accionó legalmente contra los generadores de IA <strong>Suno</strong> y <strong>Udio</strong>, alegando que estas plataformas rasparon millones de canciones sin consentimiento, afectando principalmente a artistas no respaldados por grandes discográficas <a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://completemusicupdate.com/musician-sues-suno-and-udio-says-indie-artists-have-been-trampled-the-most-by-unlicensed-ai/?utm_source=chatgpt.com">Reuters+9CMU | the music business explained+9RouteNote+9</a>.</p><h3>⚠️ Términos con trampas</h3><p>Expertos y defensores de derechos recomiendan a los artistas leer con detenimiento los acuerdos de distribución. Frases como <strong>“machine learning”</strong>, <strong>“data analysis”</strong> o <strong>“service improvement”</strong> suelen ocultar cláusulas que permiten entrenar IA sin autorización directa <a target="_blank" rel="noopener noreferrer nofollow" href="http://musiciansformusicians.org">musiciansformusicians.org</a>.</p><hr><h3>🧭 ¿Qué hacer ahora?</h3><ul><li><p>Revisa bien los términos de uso antes de distribuir tu música.</p></li><li><p>Exige cláusulas que limiten o prohíban el uso de tu música para entrenar IA.</p></li><li><p>Apoya las demandas colectivas y reformas legales que protejan a los creadores frente a grandes plataformas.</p></li></ul><hr><h3>🌟 En resumen</h3><p>SoundOn expone cómo una prestación útil para artistas emergentes también puede convertirse en un canal para contenido generado por IA sin control. El caso Blaze Foley y la acción judicial de Anthony Justice ponen presión sobre la industria para cerrar estas brechas antes que se exploten a mayor escala.</p>	https://media.gettyimages.com/id/2224449965/es/foto/in-this-photo-illustration-the-spotify-logo-is-seen-displayed-on-a-smartphone-screen.jpg?s=1024x1024&w=gi&k=20&c=19m3EqO63ShY1NFL5xYiZoqlD2wpI52A2sPu704bZMc=	f	f	t	2025-07-22 19:46:12.386	1	1	0	0	0	2025-07-22 19:46:12.950558	2025-07-22 19:46:12.950558	{7}	published	\N	\N	\N	\N	33
9	Van der Poel abandona el Tour de Francia por neumonía	van-der-poel-abandona-el-tour-de-francia-por-neumonia	Mathieu van der Poel, tras ganar una etapa y portar el maillot amarillo, tuvo que retirarse antes de la etapa 16 al ser diagnosticado con neumonía. Su equipo Alpecin-Deceuninck prioriza la salud y recomienda una semana de reposo.	<p><strong>Santo Domingo, 22 de julio de 2025</strong> – El neerlandés <strong>Mathieu van der Poel</strong> ha abandonado el Tour de Francia antes del arranque de la etapa 16 (Montpellier–Mont Ventoux) al ser diagnosticado con neumonía, informó su equipo <strong>Alpecin-Deceuninck</strong>&nbsp;<a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://cadenaser.com/nacional/2025/07/22/van-der-poel-abandona-el-tour-por-una-neumonia-cadena-ser/?utm_source=chatgpt.com">VG+15Cadena SER+15Diario AS+15</a>.</p><h3>🤒 Evolución de la enfermedad</h3><p>El ciclista había presentado síntomas de resfriado en días previos, pero su estado empeoró significativamente durante la jornada de descanso del lunes, cuando además desarrolló fiebre. Fue trasladado a un hospital en Narbona, donde le confirmaron la neumonía. El personal médico recomendó su retirada inmediata y reposo total por al menos una semana&nbsp;<a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://cadenaser.com/nacional/2025/07/22/van-der-poel-abandona-el-tour-por-una-neumonia-cadena-ser/?utm_source=chatgpt.com">NBC Sports+5Cadena SER+5Diario AS+5</a>.</p><h3>✅ Balance del Tour</h3><p>Van der Poel se convirtió en uno de los nombres destacados del Tour 2025: ganó la segunda etapa, vistió de amarillo en varias jornadas, fue tercero en la general por puntos y fue noticia por sus frecuentes ataques en las etapas alpinas&nbsp;<a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://cadenaser.com/nacional/2025/07/22/van-der-poel-abandona-el-tour-por-una-neumonia-cadena-ser/?utm_source=chatgpt.com">Cyclingnews+15Cadena SER+15Diario AS+15</a>.</p><h3>⚠️ Impacto para el equipo</h3><p>Este abandono se suma al de <strong>Jasper Philipsen</strong>, quien también debió retirarse tras una caída sufrida en la etapa 3. Alpecin-Deceuninck se queda sin sus dos grandes cartas, justo en momentos clave de la carrera&nbsp;<a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://as.com/ciclismo/tour_francia/van-der-poel-abanadona-el-tour-con-neumonia-n/?utm_source=chatgpt.com">VG+15Diario AS+</a><a target="_blank" rel="noopener noreferrer nofollow" href="http://15domestiquecycling.com">15domestiquecycling.com</a><a target="_blank" rel="noopener" class="flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]! transition-colors duration-150 ease-in-out" href="https://as.com/ciclismo/tour_francia/van-der-poel-abanadona-el-tour-con-neumonia-n/?utm_source=chatgpt.com">+15</a>.</p><hr><h3>🧭 ¿Qué viene ahora?</h3><ul><li><p><strong>Recuperación</strong>: se estima un reposo completo de al menos una semana.</p></li><li><p><strong>Reevaluación médica</strong>: tras ese periodo se determinará un plan de rehabilitación y posibles metas futuras.</p></li><li><p><strong>Carrera sin bandera</strong>: sin su líder y su velocista estrella, el equipo deberá encontrar nuevas estrategias para las etapas restantes.</p></li></ul><hr><h3>🎯 En resumen</h3><p>La retirada de Mathieu van der Poel por neumonía es un duro golpe para el Tour de Francia y para Alpecin-Deceuninck. El joven neerlandés, mito viviente y figura proactiva en este Tour, deberá centrar ahora todos sus esfuerzos en recuperarse y volver más fuerte.</p>	https://cdn.mos.cms.futurecdn.net/6JMW8tc4M4h9kgrjjhstgh-1920-80.jpg.webp	f	f	t	2025-07-22 19:49:02.452	4	1	0	0	0	2025-07-22 19:49:02.986142	2025-07-22 19:49:02.986142	{4}	published	\N	\N	\N	\N	33
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.audit_logs (id, admin_user_id, action, entity_type, entity_id, changes, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: authors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.authors (id, name, email, bio, avatar, created_at) FROM stdin;
1	María González	maria@safrareport.com	Periodista especializada en política nacional con más de 10 años de experiencia.	https://images.unsplash.com/photo-1494790108755-2616b612b1e1?w=150&h=150&fit=crop&crop=face	2025-07-21 22:06:19.919925
2	Carlos Rodríguez	carlos@safrareport.com	Corresponsal internacional y experto en economía latinoamericana.	https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face	2025-07-21 22:06:19.919925
3	Ana Martínez	ana@safrareport.com	Reportera de deportes con cobertura especial en béisbol dominicano.	https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face	2025-07-21 22:06:19.919925
4	Luis Peña	luis@safrareport.com	Editor de tecnología y especialista en innovación digital.	https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face	2025-07-21 22:06:19.919925
\.


--
-- Data for Name: business_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.business_categories (id, name, slug, icon) FROM stdin;
1	Restaurantes	restaurantes	fa-utensils
2	Hoteles	hoteles	fa-bed
3	Productos Tech	productos-tech	fa-laptop
4	Servicios	servicios	fa-tools
7	Tiendas	tiendas	shopping-bag
\.


--
-- Data for Name: businesses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.businesses (id, name, slug, description, address, phone, whatsapp, email, website, images, price_range, category_id, province_id, municipality, average_rating, total_reviews, verified, active, created_at) FROM stdin;
1	Restaurante El Mesón	restaurante-el-meson	Cocina dominicana tradicional con más de 20 años de experiencia	Av. Winston Churchill #45	809-555-1001	\N	\N	\N	[]	2	1	1	\N	4.5	2	f	t	2025-07-22 00:19:32.838157
2	Hotel Caribe Playa	hotel-caribe-playa	Resort todo incluido frente al mar con todas las comodidades	Playa Bávaro	809-555-2001	\N	\N	\N	[]	3	2	5	\N	5.0	1	f	t	2025-07-22 00:19:32.838157
3	TechStore RD	techstore-rd	La mejor tecnología al mejor precio, con garantía local	Plaza Naco	809-555-3001	\N	\N	\N	[]	2	3	1	\N	4.0	1	f	t	2025-07-22 00:19:32.838157
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.categories (id, name, slug, icon, description, created_at) FROM stdin;
1	Nacional	nacional	fa-flag	Noticias nacionales de República Dominicana	2025-07-21 22:06:19.836178
2	Internacional	internacional	fa-globe	Noticias internacionales y mundiales	2025-07-21 22:06:19.836178
3	Economía	economia	fa-chart-line	Noticias económicas y financieras	2025-07-21 22:06:19.836178
4	Deportes	deportes	fa-futbol	Noticias deportivas nacionales e internacionales	2025-07-21 22:06:19.836178
5	Entretenimiento	entretenimiento	fa-star	Entretenimiento, celebridades y espectáculos	2025-07-21 22:06:19.836178
6	Turismo	turismo	fa-plane	Turismo y destinos en República Dominicana	2025-07-21 22:06:19.836178
7	Tecnología	tecnologia	fa-laptop	Noticias de tecnología e innovación	2025-07-21 22:06:19.836178
8	Cultura	cultura	fa-palette	Arte, cultura y tradiciones dominicanas	2025-07-21 22:06:19.836178
9	Opinión	opinion	fa-edit	Artículos de opinión y editorial	2025-07-21 22:06:19.836178
10	Salud	salud	fa-heartbeat	Salud y bienestar	2025-07-21 22:06:19.836178
\.


--
-- Data for Name: classified_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.classified_categories (id, name, slug, icon) FROM stdin;
1	Vehículos	vehiculos	fa-car
2	Inmuebles	inmuebles	fa-home
3	Empleos	empleos	fa-briefcase
4	Electrónicos	electronicos	fa-mobile-alt
5	Hogar	hogar	fa-couch
6	Servicios	servicios	fa-tools
9	Tecnología	tecnologia	smartphone
\.


--
-- Data for Name: classifieds; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.classifieds (id, title, description, price, currency, images, contact_name, contact_phone, contact_whatsapp, contact_email, province_id, municipality, category_id, active, featured, expires_at, created_at) FROM stdin;
1	Toyota Corolla 2020	Excelente condición, poco kilometraje. Color gris, transmisión automática.	950000.00	DOP	[]	Pedro Martínez	809-555-0001	8095550001	\N	1	\N	1	t	f	2025-08-21 00:19:32.838157	2025-07-22 00:19:32.838157
2	Apartamento en Piantini	3 habitaciones, 2 baños, área social, balcón con vista. 150m2.	8500000.00	DOP	[]	Ana García	809-555-0002	8095550002	\N	1	\N	2	t	f	2025-08-21 00:19:32.838157	2025-07-22 00:19:32.838157
3	iPhone 14 Pro Max	Nuevo en caja, 256GB, color negro. Incluye accesorios originales.	75000.00	DOP	[]	Carlos Reyes	809-555-0003	8095550003	\N	2	\N	3	t	f	2025-08-21 00:19:32.838157	2025-07-22 00:19:32.838157
\.


--
-- Data for Name: moderation_queue; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.moderation_queue (id, entity_type, entity_id, status, submitted_by, moderated_by, moderation_notes, created_at, moderated_at) FROM stdin;
\.


--
-- Data for Name: provinces; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.provinces (id, name, code) FROM stdin;
1	Distrito Nacional	DN
2	Santo Domingo	SD
3	Santiago	ST
4	La Altagracia	AL
5	Puerto Plata	PP
6	San Cristóbal	SC
7	La Vega	LV
8	Azua	AZ
11	La Romana	LR
13	Punta Cana	PC
16	Baoruco	BR
17	Barahona	BH
18	Dajabón	DJ
19	Duarte	DU
20	El Seibo	ES
21	Elías Piña	EP
22	Espaillat	ET
23	Hato Mayor	HM
24	Hermanas Mirabal	HM2
25	Independencia	IN
26	La Altagracia	LA
29	María Trinidad Sánchez	MT
30	Monseñor Nouel	MN
31	Monte Cristi	MC
32	Monte Plata	MP
33	Pedernales	PD
34	Peravia	PE
36	Samaná	SM
38	San José de Ocoa	SO
39	San Juan	SJ
40	San Pedro de Macorís	SP
41	Sánchez Ramírez	SR
43	Santiago Rodríguez	ST2
45	Valverde	VV
46	Internacional	INT
57	Hermanas Mirabal	HMB
62	María Trinidad Sánchez	MTS
67	Peravia	PV
72	San José de Ocoa	SJO
74	San Pedro de Macorís	SPM
76	Santiago Rodríguez	STR
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.reviews (id, business_id, reviewer_name, reviewer_email, rating, title, content, images, helpful, approved, created_at) FROM stdin;
1	1	María López	\N	5	Excelente comida dominicana	El mejor mofongo que he probado. Servicio excelente y ambiente familiar.	[]	0	t	2025-07-22 00:19:32.838157
2	1	Juan Pérez	\N	4	Muy bueno	Rica comida, aunque el servicio fue un poco lento. Volveré.	[]	0	t	2025-07-22 00:19:32.838157
3	2	Ana Rodríguez	\N	5	Vacaciones perfectas	Hotel hermoso, playa limpia, comida variada. Lo recomiendo 100%.	[]	0	t	2025-07-22 00:19:32.838157
4	3	Pedro Gómez	\N	4	Buenos precios	Encontré lo que buscaba a buen precio. Personal muy atento.	[]	0	t	2025-07-22 00:19:32.838157
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
diZWq8IO46l1vBHJcjCqbviiHlEEtCpt	{"cookie": {"path": "/", "secure": true, "expires": "2025-07-29T11:54:43.578Z", "httpOnly": true, "originalMaxAge": 604800000}, "replit.com": {"code_verifier": "VZN_cj2XL0FYKF2cBz_WZXJuU4uRQxEZfgbyUffiXZk"}}	2025-07-29 11:54:44
DsSaAOFAG3FrHggYqjdumTSgHuZeAgZt	{"cookie": {"path": "/", "secure": true, "expires": "2025-07-29T15:23:23.822Z", "httpOnly": true, "originalMaxAge": 604800000}}	2025-07-29 15:23:24
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password, role) FROM stdin;
\.


--
-- Name: ad_analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.ad_analytics_id_seq', 1, false);


--
-- Name: ad_placements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.ad_placements_id_seq', 6, true);


--
-- Name: admin_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.admin_sessions_id_seq', 1, true);


--
-- Name: admin_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.admin_users_id_seq', 1, true);


--
-- Name: ads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.ads_id_seq', 1, false);


--
-- Name: articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.articles_id_seq', 11, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: authors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.authors_id_seq', 4, true);


--
-- Name: business_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.business_categories_id_seq', 7, true);


--
-- Name: businesses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.businesses_id_seq', 3, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.categories_id_seq', 10, true);


--
-- Name: classified_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.classified_categories_id_seq', 9, true);


--
-- Name: classifieds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.classifieds_id_seq', 3, true);


--
-- Name: moderation_queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.moderation_queue_id_seq', 1, false);


--
-- Name: provinces_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.provinces_id_seq', 78, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.reviews_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: ad_analytics ad_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ad_analytics
    ADD CONSTRAINT ad_analytics_pkey PRIMARY KEY (id);


--
-- Name: ad_placements ad_placements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ad_placements
    ADD CONSTRAINT ad_placements_pkey PRIMARY KEY (id);


--
-- Name: ad_placements ad_placements_slug_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ad_placements
    ADD CONSTRAINT ad_placements_slug_unique UNIQUE (slug);


--
-- Name: admin_sessions admin_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_pkey PRIMARY KEY (id);


--
-- Name: admin_sessions admin_sessions_token_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_token_unique UNIQUE (token);


--
-- Name: admin_users admin_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_unique UNIQUE (email);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_replit_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_replit_id_key UNIQUE (replit_id);


--
-- Name: admin_users admin_users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_username_unique UNIQUE (username);


--
-- Name: ads ads_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_pkey PRIMARY KEY (id);


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: articles articles_slug_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_slug_unique UNIQUE (slug);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: authors authors_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_email_unique UNIQUE (email);


--
-- Name: authors authors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_pkey PRIMARY KEY (id);


--
-- Name: business_categories business_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.business_categories
    ADD CONSTRAINT business_categories_pkey PRIMARY KEY (id);


--
-- Name: business_categories business_categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.business_categories
    ADD CONSTRAINT business_categories_slug_unique UNIQUE (slug);


--
-- Name: businesses businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_pkey PRIMARY KEY (id);


--
-- Name: businesses businesses_slug_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_slug_unique UNIQUE (slug);


--
-- Name: categories categories_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_unique UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_unique UNIQUE (slug);


--
-- Name: classified_categories classified_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.classified_categories
    ADD CONSTRAINT classified_categories_pkey PRIMARY KEY (id);


--
-- Name: classified_categories classified_categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.classified_categories
    ADD CONSTRAINT classified_categories_slug_unique UNIQUE (slug);


--
-- Name: classifieds classifieds_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.classifieds
    ADD CONSTRAINT classifieds_pkey PRIMARY KEY (id);


--
-- Name: moderation_queue moderation_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.moderation_queue
    ADD CONSTRAINT moderation_queue_pkey PRIMARY KEY (id);


--
-- Name: provinces provinces_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT provinces_code_unique UNIQUE (code);


--
-- Name: provinces provinces_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT provinces_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: idx_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_session_expire ON public.sessions USING btree (expire);


--
-- Name: ad_analytics ad_analytics_ad_id_ads_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ad_analytics
    ADD CONSTRAINT ad_analytics_ad_id_ads_id_fk FOREIGN KEY (ad_id) REFERENCES public.ads(id);


--
-- Name: ad_analytics ad_analytics_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ad_analytics
    ADD CONSTRAINT ad_analytics_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: ad_analytics ad_analytics_province_id_provinces_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ad_analytics
    ADD CONSTRAINT ad_analytics_province_id_provinces_id_fk FOREIGN KEY (province_id) REFERENCES public.provinces(id);


--
-- Name: admin_sessions admin_sessions_admin_user_id_admin_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_admin_user_id_admin_users_id_fk FOREIGN KEY (admin_user_id) REFERENCES public.admin_users(id);


--
-- Name: ads ads_created_by_admin_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_created_by_admin_users_id_fk FOREIGN KEY (created_by) REFERENCES public.admin_users(id);


--
-- Name: ads ads_placement_id_ad_placements_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_placement_id_ad_placements_id_fk FOREIGN KEY (placement_id) REFERENCES public.ad_placements(id);


--
-- Name: articles articles_author_id_authors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_author_id_authors_id_fk FOREIGN KEY (author_id) REFERENCES public.authors(id);


--
-- Name: articles articles_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: articles articles_province_id_provinces_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_province_id_provinces_id_fk FOREIGN KEY (province_id) REFERENCES public.provinces(id);


--
-- Name: audit_logs audit_logs_admin_user_id_admin_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_admin_user_id_admin_users_id_fk FOREIGN KEY (admin_user_id) REFERENCES public.admin_users(id);


--
-- Name: businesses businesses_category_id_business_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_category_id_business_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.business_categories(id);


--
-- Name: businesses businesses_province_id_provinces_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_province_id_provinces_id_fk FOREIGN KEY (province_id) REFERENCES public.provinces(id);


--
-- Name: classifieds classifieds_category_id_classified_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.classifieds
    ADD CONSTRAINT classifieds_category_id_classified_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.classified_categories(id);


--
-- Name: classifieds classifieds_province_id_provinces_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.classifieds
    ADD CONSTRAINT classifieds_province_id_provinces_id_fk FOREIGN KEY (province_id) REFERENCES public.provinces(id);


--
-- Name: moderation_queue moderation_queue_moderated_by_admin_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.moderation_queue
    ADD CONSTRAINT moderation_queue_moderated_by_admin_users_id_fk FOREIGN KEY (moderated_by) REFERENCES public.admin_users(id);


--
-- Name: reviews reviews_business_id_businesses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_business_id_businesses_id_fk FOREIGN KEY (business_id) REFERENCES public.businesses(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

