-- Create countries table
CREATE TABLE public.countries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    country_name_en text NOT NULL,
    country_name_ar text,
    country_code text NOT NULL UNIQUE,
    phone_code text NOT NULL,
    flag_emoji text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on countries
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read countries (public data)
CREATE POLICY "Countries are viewable by everyone" 
ON public.countries 
FOR SELECT 
USING (is_active = true);

-- Create admin_users table
CREATE TABLE public.admin_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    admin_role text NOT NULL DEFAULT 'admin',
    permissions jsonb DEFAULT '{}',
    created_by uuid REFERENCES auth.users(id),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can manage admin_users
CREATE POLICY "Admins can manage admin users" 
ON public.admin_users 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users au 
        WHERE au.user_id = auth.uid() AND au.is_active = true
    )
);

-- Restructure activities table (rename existing tour_activities to activities)
ALTER TABLE public.tour_activities RENAME TO activities;

-- Add new fields to activities table
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS activity_id text UNIQUE DEFAULT gen_random_uuid()::text,
ADD COLUMN IF NOT EXISTS tourist_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS tour_guide_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Update existing data to set tourist_id and tour_guide_id from tour_assignment_id
UPDATE public.activities 
SET 
    tourist_id = (SELECT ta.tourist_id FROM public.tour_assignments ta WHERE ta.id = activities.tour_assignment_id),
    tour_guide_id = (SELECT ta.guide_id FROM public.tour_assignments ta WHERE ta.id = activities.tour_assignment_id),
    created_by = (SELECT ta.guide_id FROM public.tour_assignments ta WHERE ta.id = activities.tour_assignment_id)
WHERE tour_assignment_id IS NOT NULL;

-- Insert popular Middle East countries
INSERT INTO public.countries (country_name_en, country_name_ar, country_code, phone_code, flag_emoji) VALUES
('Saudi Arabia', 'المملكة العربية السعودية', 'SA', '+966', '🇸🇦'),
('United Arab Emirates', 'دولة الإمارات العربية المتحدة', 'AE', '+971', '🇦🇪'),
('Kuwait', 'دولة الكويت', 'KW', '+965', '🇰🇼'),
('Qatar', 'دولة قطر', 'QA', '+974', '🇶🇦'),
('Bahrain', 'مملكة البحرين', 'BH', '+973', '🇧🇭'),
('Oman', 'سلطنة عُمان', 'OM', '+968', '🇴🇲'),
('Jordan', 'المملكة الأردنية الهاشمية', 'JO', '+962', '🇯🇴'),
('Lebanon', 'الجمهورية اللبنانية', 'LB', '+961', '🇱🇧'),
('Egypt', 'جمهورية مصر العربية', 'EG', '+20', '🇪🇬'),
('Turkey', 'Türkiye', 'TR', '+90', '🇹🇷'),
('Iran', 'جمهوری اسلامی ایران', 'IR', '+98', '🇮🇷'),
('Iraq', 'جمهورية العراق', 'IQ', '+964', '🇮🇶'),
('Syria', 'الجمهورية العربية السورية', 'SY', '+963', '🇸🇾'),
('Yemen', 'الجمهورية اليمنية', 'YE', '+967', '🇾🇪'),
('Palestine', 'دولة فلسطين', 'PS', '+970', '🇵🇸'),
-- Add other major countries
('United States', 'الولايات المتحدة الأمريكية', 'US', '+1', '🇺🇸'),
('United Kingdom', 'المملكة المتحدة', 'GB', '+44', '🇬🇧'),
('Germany', 'ألمانيا', 'DE', '+49', '🇩🇪'),
('France', 'فرنسا', 'FR', '+33', '🇫🇷'),
('Canada', 'كندا', 'CA', '+1', '🇨🇦'),
('Australia', 'أستراليا', 'AU', '+61', '🇦🇺'),
('Japan', 'اليابان', 'JP', '+81', '🇯🇵'),
('China', 'الصين', 'CN', '+86', '🇨🇳'),
('India', 'الهند', 'IN', '+91', '🇮🇳'),
('Pakistan', 'باكستان', 'PK', '+92', '🇵🇰'),
('Bangladesh', 'بنغلاديش', 'BD', '+880', '🇧🇩'),
('Indonesia', 'إندونيسيا', 'ID', '+62', '🇮🇩'),
('Malaysia', 'ماليزيا', 'MY', '+60', '🇲🇾'),
('Singapore', 'سنغافورة', 'SG', '+65', '🇸🇬'),
('Philippines', 'الفلبين', 'PH', '+63', '🇵🇭'),
('Thailand', 'تايلاند', 'TH', '+66', '🇹🇭'),
('South Korea', 'كوريا الجنوبية', 'KR', '+82', '🇰🇷'),
('Russia', 'روسيا', 'RU', '+7', '🇷🇺'),
('Brazil', 'البرازيل', 'BR', '+55', '🇧🇷'),
('Mexico', 'المكسيك', 'MX', '+52', '🇲🇽'),
('Argentina', 'الأرجنتين', 'AR', '+54', '🇦🇷'),
('South Africa', 'جنوب أفريقيا', 'ZA', '+27', '🇿🇦'),
('Nigeria', 'نيجيريا', 'NG', '+234', '🇳🇬'),
('Morocco', 'المغرب', 'MA', '+212', '🇲🇦'),
('Algeria', 'الجزائر', 'DZ', '+213', '🇩🇿'),
('Tunisia', 'تونس', 'TN', '+216', '🇹🇳'),
('Libya', 'ليبيا', 'LY', '+218', '🇱🇾'),
('Sudan', 'السودان', 'SD', '+249', '🇸🇩'),
('Ethiopia', 'إثيوبيا', 'ET', '+251', '🇪🇹'),
('Kenya', 'كينيا', 'KE', '+254', '🇰🇪');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_countries_updated_at
    BEFORE UPDATE ON public.countries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();