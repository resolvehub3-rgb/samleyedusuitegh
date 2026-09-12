import React, { useState, useMemo, useCallback } from 'react';
import {
  MessageSquare,
  Mail,
  Phone,
  Trash2,
  CheckCheck,
  MailOpen,
  Search,
  School,
  Clock,
  Filter,
  X,
  Square,
  CheckSquare,
  Loader2,
} from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { EmptyState } from '../common/EmptyState';
import { SkeletonTable } from '../common/SkeletonLoader';

export const SuperAdminContactMessages: React.FC = () => {
  const {
    contactMessages,
    loading,
    markContactMessageRead,
    markAllContactMessagesRead,
    deleteContactMessage,
    unreadContactMessages,
  } = useSuperAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set<string>());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const filteredMessages = useMemo(() => {
    let messages = [...contactMessages];

    if (filter === 'unread') messages = messages.filter((m) => !m.is_read);
    if (filter === 'read') messages = messages.filter((m) => m.is_read);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      messages = messages.filter(
        (m) =>
          m.full_name.toLowerCase().includes(q) ||
          m.school_name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q)
      );
    }

    return messages;
  }, [contactMessages, searchQuery, filter]);

  const allVisibleSelected =
    filteredMessages.length > 0 && filteredMessages.every((m) => selectedIds.has(m.id));
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = useCallback(() => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMessages.map((m) => m.id)));
    }
  }, [allVisibleSelected, filteredMessages]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setConfirmBulkDelete(false);
  }, []);

  const handleBulkMarkRead = async () => {
    setBulkActionLoading(true);
    const ids: string[] = [...selectedIds];
    await Promise.all(ids.map((id) => markContactMessageRead(id)));
    clearSelection();
    setBulkActionLoading(false);
  };

  const handleBulkDelete = async () => {
    setBulkActionLoading(true);
    const ids: string[] = [...selectedIds];
    await Promise.all(ids.map((id) => deleteContactMessage(id)));
    clearSelection();
    setBulkActionLoading(false);
  };

  if (loading && contactMessages.length === 0) return <SkeletonTable rows={6} />;

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    const msg = contactMessages.find((m) => m.id === id);
    if (msg && !msg.is_read) {
      markContactMessageRead(id);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteContactMessage(id);
    setConfirmDeleteId(null);
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Contact Messages
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {unreadContactMessages > 0
              ? `${unreadContactMessages} unread message${unreadContactMessages !== 1 ? 's' : ''}`
              : 'All messages read'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadContactMessages > 0 && (
            <button
              onClick={markAllContactMessagesRead}
              className="px-4 py-2 text-xs font-semibold text-orange-600 border border-orange-200 dark:border-orange-800 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {someSelected && (
        <div className="flex items-center justify-between gap-3 p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-orange-700 dark:text-orange-300">
              {selectedIds.size} selected
            </span>
            <button
              onClick={clearSelection}
              className="text-xs text-orange-600 hover:text-orange-800 dark:text-orange-400 font-semibold cursor-pointer"
            >
              Clear
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkMarkRead}
              disabled={bulkActionLoading}
              className="px-3 py-1.5 text-xs font-semibold text-orange-700 dark:text-orange-300 bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {bulkActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MailOpen className="w-3.5 h-3.5" />}
              Mark read
            </button>
            {!confirmBulkDelete ? (
              <button
                onClick={() => setConfirmBulkDelete(true)}
                disabled={bulkActionLoading}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkActionLoading}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-rose-500 rounded-lg hover:bg-rose-600 cursor-pointer flex items-center gap-1 disabled:opacity-50"
                >
                  {bulkActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Confirm delete ({selectedIds.size})
                </button>
                <button
                  onClick={() => setConfirmBulkDelete(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, school, email, or message..."
            className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {(['all', 'unread', 'read'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer capitalize ${
                filter === f
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f}
              {f === 'unread' && unreadContactMessages > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-orange-200 text-orange-800">
                  {unreadContactMessages}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Select All Row */}
      {filteredMessages.length > 0 && (
        <div className="flex items-center gap-3 px-1">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors"
          >
            {allVisibleSelected ? (
              <CheckSquare className="w-4 h-4 text-orange-500" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {allVisibleSelected ? 'Deselect all' : 'Select all'}
          </button>
          {someSelected && (
            <span className="text-[11px] text-slate-400">
              {selectedIds.size} of {filteredMessages.length} selected
            </span>
          )}
        </div>
      )}

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={searchQuery || filter !== 'all' ? 'No matching messages' : 'No messages yet'}
          description={
            searchQuery || filter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Contact form submissions from visitors will appear here in real-time.'
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredMessages.map((msg) => {
            const isExpanded = expandedId === msg.id;
            const isDeleting = confirmDeleteId === msg.id;
            const isSelected = selectedIds.has(msg.id);

            return (
              <div
                key={msg.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl shadow-xs transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-orange-300 dark:border-orange-700 ring-1 ring-orange-200 dark:ring-orange-800'
                    : !msg.is_read
                      ? 'border-orange-200 dark:border-orange-800/50 border-l-4 border-l-orange-500'
                      : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Collapsed Header */}
                <div className="flex items-center gap-3 p-4">
                  {/* Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(msg.id);
                    }}
                    className="shrink-0 cursor-pointer transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4.5 h-4.5 text-orange-500" />
                    ) : (
                      <Square className="w-4.5 h-4.5 text-slate-300 dark:text-slate-600 hover:text-slate-400 dark:hover:text-slate-500" />
                    )}
                  </button>

                  {/* Icon */}
                  <div
                    className={`p-2.5 rounded-xl shrink-0 cursor-pointer ${
                      !msg.is_read
                        ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/40'
                        : 'text-slate-500 bg-slate-50 dark:bg-slate-800'
                    }`}
                    onClick={() => toggleExpand(msg.id)}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleExpand(msg.id)}>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {msg.full_name}
                      </p>
                      {!msg.is_read && (
                        <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <School className="w-3 h-3" /> {msg.school_name}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Mail className="w-3 h-3" /> {msg.email}
                      </span>
                    </div>
                  </div>

                  {/* Right side: timestamp + actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400 whitespace-nowrap hidden sm:block">
                      {new Date(msg.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <div className="flex items-center gap-1">
                      {!msg.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markContactMessageRead(msg.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors cursor-pointer"
                          title="Mark as read"
                        >
                          <MailOpen className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!isDeleting ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(msg.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(msg.id);
                            }}
                            className="px-2 py-1 text-[10px] font-bold text-white bg-rose-500 rounded-lg hover:bg-rose-600 cursor-pointer"
                          >
                            Delete
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-slate-800 mt-0">
                    <div className="pt-3 space-y-3">
                      {/* Contact Details */}
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <a
                            href={`mailto:${msg.email}`}
                            className="hover:text-orange-600 dark:hover:text-orange-400 underline underline-offset-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {msg.email}
                          </a>
                        </div>
                        {msg.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <a
                              href={`tel:${msg.phone}`}
                              className="hover:text-orange-600 dark:hover:text-orange-400"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {msg.phone}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          {new Date(msg.created_at).toLocaleString([], {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      {/* Message Body */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">
                          Message
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {msg.message}
                        </p>
                      </div>

                      {/* Read Status */}
                      {msg.is_read && (
                        <p className="text-[10px] text-slate-400">
                          Read{' '}
                          {msg.read_at
                            ? `on ${new Date(msg.read_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                            : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer count */}
      {filteredMessages.length > 0 && (
        <p className="text-center text-[11px] text-slate-400">
          Showing {filteredMessages.length} of {contactMessages.length} message{contactMessages.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};
