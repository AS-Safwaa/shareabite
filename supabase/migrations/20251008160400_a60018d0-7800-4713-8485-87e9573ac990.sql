-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'merchant');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'Tamil Nadu',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create merchant_details table for merchant-specific info
CREATE TABLE public.merchant_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT,
  logo_url TEXT,
  pickup_hours TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.merchant_details ENABLE ROW LEVEL SECURITY;

-- Create food_listings table
CREATE TABLE public.food_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  available_quantity INTEGER NOT NULL,
  image_url TEXT,
  expiry_at TIMESTAMP WITH TIME ZONE NOT NULL,
  pickup_time_start TEXT NOT NULL,
  pickup_time_end TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'expired', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.food_listings ENABLE ROW LEVEL SECURITY;

-- Create food_requests table
CREATE TABLE public.food_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID REFERENCES public.food_listings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  merchant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL,
  pickup_time TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.food_requests ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- User Roles RLS Policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Merchant Details RLS Policies
CREATE POLICY "Merchants can view their own details"
  ON public.merchant_details FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Merchants can update their own details"
  ON public.merchant_details FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Merchants can insert their own details"
  ON public.merchant_details FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all merchant details"
  ON public.merchant_details FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Food Listings RLS Policies
CREATE POLICY "Anyone can view available food listings"
  ON public.food_listings FOR SELECT
  USING (true);

CREATE POLICY "Merchants can insert their own listings"
  ON public.food_listings FOR INSERT
  WITH CHECK (auth.uid() = merchant_id AND public.has_role(auth.uid(), 'merchant'));

CREATE POLICY "Merchants can update their own listings"
  ON public.food_listings FOR UPDATE
  USING (auth.uid() = merchant_id AND public.has_role(auth.uid(), 'merchant'));

CREATE POLICY "Merchants can delete their own listings"
  ON public.food_listings FOR DELETE
  USING (auth.uid() = merchant_id AND public.has_role(auth.uid(), 'merchant'));

CREATE POLICY "Admins can manage all listings"
  ON public.food_listings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Food Requests RLS Policies
CREATE POLICY "Users can view their own requests"
  ON public.food_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Merchants can view requests for their food"
  ON public.food_requests FOR SELECT
  USING (auth.uid() = merchant_id);

CREATE POLICY "Users can create requests"
  ON public.food_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'user'));

CREATE POLICY "Users can update their own requests"
  ON public.food_requests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Merchants can update requests for their food"
  ON public.food_requests FOR UPDATE
  USING (auth.uid() = merchant_id);

CREATE POLICY "Admins can view all requests"
  ON public.food_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all requests"
  ON public.food_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_food_listings_updated_at
  BEFORE UPDATE ON public.food_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_food_requests_updated_at
  BEFORE UPDATE ON public.food_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();