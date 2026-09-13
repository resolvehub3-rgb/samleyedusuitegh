-- =============================================================================
-- FAQ ITEMS TABLE — SamleyEduSuite
-- Run this in Supabase SQL Editor to add FAQ management support
-- =============================================================================

-- Create FAQ items table
CREATE TABLE IF NOT EXISTS public.faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL CHECK (section IN ('general', 'subscription')),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

-- Public read access (landing page needs to read FAQ without auth)
CREATE POLICY "FAQ items public read" ON public.faq_items
  FOR SELECT USING (is_active = TRUE);

-- Super admin full access
CREATE POLICY "FAQ items super admin all" ON public.faq_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.faq_items;

-- Seed general FAQ items
INSERT INTO public.faq_items (section, question, answer, sort_order) VALUES
('general', 'What is SamleyEduSuite?', 'SamleyEduSuite is a modern digital school management system designed for private schools in Ghana. It provides a connected platform to manage students, teachers, parents, attendance, academic performance, terminal reports, announcements, payments and more.', 1),
('general', 'Who can use SamleyEduSuite?', 'SamleyEduSuite is designed for Ghanaian private schools and their authorized administrators, teachers and parents. School owners register the school, then invite teachers and parents to join.', 2),
('general', 'Is there a student portal?', 'No. SamleyEduSuite does not provide a student login portal. The platform serves school administrators, teachers and parents.', 3),
('general', 'Can parents monitor their wards?', 'Yes. Parents can view their wards'' class, class teacher, attendance history, academic performance, terminal reports, school announcements and receive notifications through the Parent Portal.', 4),
('general', 'Can parents make payments?', 'Yes. Where the school administrator has configured payment functionality, parents can make and monitor school payments through the Parent Portal.', 5),
('general', 'Can teachers record attendance?', 'Yes. Teachers can record daily attendance for classes they are authorized to manage. Administrators can monitor attendance across all classes.', 6),
('general', 'Can teachers generate terminal reports?', 'Yes. Where the school administrator has assigned the required class and report permissions, teachers can generate professional terminal report cards for their students.', 7),
('general', 'Does the platform work on mobile?', 'Yes. The interface is fully responsive and optimized for both mobile phones and desktop computers.', 8),
('general', 'Does the system work in realtime?', 'Yes. Relevant platform features use Supabase Realtime to deliver updates instantly across connected users without requiring page refreshes.', 9);

-- Seed subscription FAQ items
INSERT INTO public.faq_items (section, question, answer, sort_order) VALUES
('subscription', 'How much does SamleyEduSuite cost?', 'SamleyEduSuite costs GH₵300 per month per school.', 1),
('subscription', 'Is there a trial?', 'Yes. Every new school receives 7 days of full access.', 2),
('subscription', 'How do I pay?', 'Make the required Mobile Money payment using the official payment details provided by SamleyEduSuite, then submit your transaction ID and payment screenshot from the School Admin Dashboard.', 3),
('subscription', 'How is payment verified?', 'The SamleyEduSuite Super Admin manually reviews submitted payment information before approving the subscription.', 4),
('subscription', 'What happens when my subscription expires?', 'Access to normal school operations is suspended until payment is submitted and approved. Your school''s data remains safe and is not deleted.', 5),
('subscription', 'How long does it take to restore access?', 'Once the Super Admin approves a valid payment, access is restored immediately.', 6),
('subscription', 'Will I lose my school''s data after expiry?', 'No. Subscription suspension does not delete school data.', 7);
