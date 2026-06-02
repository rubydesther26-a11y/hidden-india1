-- Supabase SQL Database Schema
-- Hidden India AI - "Travel Like a Local, Not Like a Tourist"

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  budget VARCHAR(50) NOT NULL,
  travel_style VARCHAR(50) NOT NULL,
  travel_experience VARCHAR(50) NOT NULL,
  interests TEXT[] NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  previously_visited TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Hidden Gems Table
CREATE TABLE IF NOT EXISTS public.hidden_gems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(55) CHECK (category IN ('village', 'waterfall', 'trek', 'market', 'viewpoint', 'cultural')),
  cost VARCHAR(100) NOT NULL,
  best_time VARCHAR(100) NOT NULL,
  crowd_level VARCHAR(50) CHECK (crowd_level IN ('very low', 'low', 'moderate')),
  safety_score NUMERIC(3, 1) NOT NULL,
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Cultural Experiences (Hero Feature)
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  event_date VARCHAR(100) NOT NULL,
  distance VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  match_score INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  category VARCHAR(50) CHECK (category IN ('festival', 'dance', 'fair', 'performance', 'workshop')),
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. User Personalized Itineraries
CREATE TABLE IF NOT EXISTS public.itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  duration_days INTEGER NOT NULL,
  overall_cost VARCHAR(100) NOT NULL,
  notes TEXT,
  days JSONB NOT NULL, -- structured array of ItineraryDay
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hidden_gems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

-- Create public read policies
CREATE POLICY "Allow public read access to hidden_gems" ON public.hidden_gems
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to experiences" ON public.experiences
  FOR SELECT USING (true);

-- Create profile write and read policies
CREATE POLICY "Allow users to manage their own profile info" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow users to manage matching itineraries" ON public.itineraries
  FOR ALL USING (true) WITH CHECK (true);

-- Seed some raw historical offbeat data for reference
INSERT INTO public.hidden_gems (name, location, description, category, cost, best_time, crowd_level, safety_score, latitude, longitude) VALUES
('Ziro Valley', 'Arunachal Pradesh', 'Lush green pine valley home of the sustainable Apatani tribe agriculture model.', 'village', '₹1,500 - ₹2,500 / day', 'September to November', 'low', 9.5, 27.5925, 93.8322),
('Mawlynnong Village', 'Meghalaya', 'Asia''s cleanest village with beautiful bamboo treehouses and ancient living root bridges.', 'village', '₹1,200 - ₹2,000 / day', 'June to September', 'moderate', 9.8, 25.2015, 91.9213),
('Majuli Island', 'Assam', 'World''s largest river island cradling traditional Neoviashnavite Satra mask-weaving.', 'cultural', '₹1,000 - ₹1,800 / day', 'October to March', 'low', 9.2, 26.9634, 94.2185);
