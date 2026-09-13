import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getSupabase } from '../lib/supabase';

export interface FaqItem {
  id: string;
  section: 'general' | 'subscription';
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FaqContextType {
  generalFaqs: FaqItem[];
  subscriptionFaqs: FaqItem[];
  allFaqs: FaqItem[];
  loading: boolean;
  fetchFaqs: () => Promise<void>;
  // Super admin
  createFaq: (data: Omit<FaqItem, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string }>;
  updateFaq: (id: string, data: Partial<FaqItem>) => Promise<{ success: boolean; error?: string }>;
  deleteFaq: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const FaqContext = createContext<FaqContextType | undefined>(undefined);

// Default FAQ data as fallback when database is empty or unavailable
const defaultGeneralFaqs: FaqItem[] = [
  { id: 'default-1', section: 'general', question: 'What is SamleyEduSuite?', answer: 'SamleyEduSuite is a modern digital school management system designed for private schools in Ghana. It provides a connected platform to manage students, teachers, parents, attendance, academic performance, terminal reports, announcements, payments and more.', sort_order: 1, is_active: true, created_at: '', updated_at: '' },
  { id: 'default-2', section: 'general', question: 'Who can use SamleyEduSuite?', answer: 'SamleyEduSuite is designed for Ghanaian private schools and their authorized administrators, teachers and parents. School owners register the school, then invite teachers and parents to join.', sort_order: 2, is_active: true, created_at: '', updated_at: '' },
  { id: 'default-3', section: 'general', question: 'Is there a student portal?', answer: 'No. SamleyEduSuite does not provide a student login portal. The platform serves school administrators, teachers and parents.', sort_order: 3, is_active: true, created_at: '', updated_at: '' },
  { id: 'default-4', section: 'general', question: 'Can parents monitor their wards?', answer: 'Yes. Parents can view their wards\' class, class teacher, attendance history, academic performance, terminal reports, school announcements and receive notifications through the Parent Portal.', sort_order: 4, is_active: true, created_at: '', updated_at: '' },
  { id: 'default-5', section: 'general', question: 'Can parents make payments?', answer: 'Yes. Where the school administrator has configured payment functionality, parents can make and monitor school payments through the Parent Portal.', sort_order: 5, is_active: true, created_at: '', updated_at: '' },
  { id: 'default-6', section: 'general', question: 'Can teachers record attendance?', answer: 'Yes. Teachers can record daily attendance for classes they are authorized to manage. Administrators can monitor attendance across all classes.', sort_order: 6, is_active: true, created_at: '', updated_at: '' },
  { id: 'default-7', section: 'general', question: 'Can teachers generate terminal reports?', answer: 'Yes. Where the school administrator has assigned the required class and report permissions, teachers can generate professional terminal report cards for their students.', sort_order: 7, is_active: true, created_at: '', updated_at: '' },
  { id: 'default-8', section: 'general', question: 'Does the platform work on mobile?', answer: 'Yes. The interface is fully responsive and optimized for both mobile phones and desktop computers.', sort_order: 8, is_active: true, created_at: '', updated_at: '' },
  { id: 'default-9', section: 'general', question: 'Does the system work in realtime?', answer: 'Yes. Relevant platform features use Supabase Realtime to deliver updates instantly across connected users without requiring page refreshes.', sort_order: 9, is_active: true, created_at: '', updated_at: '' },
];

const defaultSubscriptionFaqs: FaqItem[] = [
  { id: 'default-sub-1', section: 'subscription', question: 'How much does SamleyEduSuite cost?', answer: 'SamleyEduSuite costs GH₵300 per month per school.', sort_order: 1, is_active: true, created_at: '', updated_at: '' },
  { id: 'default-sub-2', section: 'subscription', question: 'Is there a trial?', answer: 'Yes. Every new school receives 7 days of full access.', sort_order: 2, is_active: true, created_at: '', updated_at: '' },
  { id: 'default-sub-3', section: 'subscription', question: 'How do I pay?', answer: 'Make the required Mobile Money payment using the official payment details provided by SamleyEduSuite, then submit your transaction ID and payment screenshot from the School Admin Dashboard.', sort_order: 3, is_active: true, created_at: '', updated_at: '' },
  { id: 'default-sub-4', section: 'subscription', question: 'How is payment verified?', answer: 'The SamleyEduSuite Super Admin manually reviews submitted payment information before approving the subscription.', sort_order: 4, is_active: true, created_at: '', updated_at: '' },
  { id: 'default-sub-5', section: 'subscription', question: 'What happens when my subscription expires?', answer: 'Access to normal school operations is suspended until payment is submitted and approved. Your school\'s data remains safe and is not deleted.', sort_order: 5, is_active: true, created_at: '', updated_at: '' },
  { id: 'default-sub-6', section: 'subscription', question: 'How long does it take to restore access?', answer: 'Once the Super Admin approves a valid payment, access is restored immediately.', sort_order: 6, is_active: true, created_at: '', updated_at: '' },
  { id: 'default-sub-7', section: 'subscription', question: 'Will I lose my school\'s data after expiry?', answer: 'No. Subscription suspension does not delete school data.', sort_order: 7, is_active: true, created_at: '', updated_at: '' },
];

export const FaqProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = getSupabase();
  const [allFaqs, setAllFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbAvailable, setDbAvailable] = useState(true);
  const mountedRef = useRef(true);

  const generalFaqs = allFaqs.filter(f => f.section === 'general').sort((a, b) => a.sort_order - b.sort_order);
  const subscriptionFaqs = allFaqs.filter(f => f.section === 'subscription').sort((a, b) => a.sort_order - b.sort_order);

  const fetchFaqs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('faq_items')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        // Table might not exist yet — use defaults
        console.warn('FAQ table not available, using defaults:', error.message);
        setDbAvailable(false);
        if (mountedRef.current) {
          setAllFaqs([...defaultGeneralFaqs, ...defaultSubscriptionFaqs]);
        }
        return;
      }

      if (mountedRef.current) {
        if (data && data.length > 0) {
          setAllFaqs(data as FaqItem[]);
          setDbAvailable(true);
        } else {
          // Table exists but empty — use defaults
          setAllFaqs([...defaultGeneralFaqs, ...defaultSubscriptionFaqs]);
        }
      }
    } catch (err) {
      console.warn('FAQ fetch failed, using defaults:', err);
      setDbAvailable(false);
      if (mountedRef.current) {
        setAllFaqs([...defaultGeneralFaqs, ...defaultSubscriptionFaqs]);
      }
    }
  }, [supabase]);

  // Super admin CRUD
  const createFaq = async (data: Omit<FaqItem, 'id' | 'created_at' | 'updated_at'>) => {
    if (!dbAvailable) return { success: false, error: 'FAQ database not available' };
    try {
      const { error } = await supabase.from('faq_items').insert({
        section: data.section,
        question: data.question,
        answer: data.answer,
        sort_order: data.sort_order,
        is_active: data.is_active,
      });
      if (error) return { success: false, error: error.message };
      await fetchFaqs();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateFaq = async (id: string, data: Partial<FaqItem>) => {
    if (!dbAvailable) return { success: false, error: 'FAQ database not available' };
    try {
      const { error } = await supabase.from('faq_items').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) return { success: false, error: error.message };
      await fetchFaqs();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteFaq = async (id: string) => {
    if (!dbAvailable) return { success: false, error: 'FAQ database not available' };
    try {
      const { error } = await supabase.from('faq_items').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      await fetchFaqs();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    fetchFaqs();
    return () => { mountedRef.current = false; };
  }, [fetchFaqs]);

  // Realtime subscription for FAQ changes
  useEffect(() => {
    if (!dbAvailable) return;

    const channel = supabase
      .channel('faq-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faq_items' }, () => {
        fetchFaqs();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, fetchFaqs, dbAvailable]);

  return (
    <FaqContext.Provider value={{ generalFaqs, subscriptionFaqs, allFaqs, loading, fetchFaqs, createFaq, updateFaq, deleteFaq }}>
      {children}
    </FaqContext.Provider>
  );
};

export const useFaq = (): FaqContextType => {
  const context = useContext(FaqContext);
  if (!context) {
    throw new Error('useFaq must be used within a FaqProvider');
  }
  return context;
};
