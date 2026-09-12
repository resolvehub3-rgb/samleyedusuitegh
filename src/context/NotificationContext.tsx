import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSupabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { NotificationItem } from '../types/database';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  sendNotification: (payload: {
    userId: string;
    schoolId: string;
    type: NotificationItem['type'];
    title: string;
    message: string;
    relatedRecordId?: string;
  }) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const supabase = getSupabase();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Ensure we have a valid session before querying
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !session) {
        console.warn('No valid session for notifications fetch:', sessionErr?.message);
        return;
      }
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
      } else if (data) {
        setNotifications(data as NotificationItem[]);
      }
    } catch (err) {
      console.error('Error in fetchNotifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    fetchNotifications();

    // Subscribe to Supabase Realtime for notifications
    const channel = supabase
      .channel(`realtime:notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotif = payload.new as NotificationItem;
          setNotifications((prev) => [newNotif, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updated = payload.new as NotificationItem;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const old = payload.old as { id: string };
          setNotifications((prev) => prev.filter((n) => n.id !== old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (!error) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      }
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (!error) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch (e) {
      console.error('Failed to mark all notifications as read:', e);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (!error) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete notification:', e);
    }
  };

  const sendNotification = async (payload: {
    userId: string;
    schoolId: string;
    type: NotificationItem['type'];
    title: string;
    message: string;
    relatedRecordId?: string;
  }): Promise<boolean> => {
    try {
      const { error } = await supabase.from('notifications').insert({
        school_id: payload.schoolId,
        user_id: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        related_record_id: payload.relatedRecordId || null,
        is_read: false
      });
      return !error;
    } catch (err) {
      console.error('Error sending notification:', err);
      return false;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        sendNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
