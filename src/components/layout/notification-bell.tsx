'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NotificationItem {
  id: string;
  clientId?: string | null;
  client?: { name: string; slug?: string } | null;
  recipientRole: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 25 seconds
    const interval = setInterval(fetchNotifications, 25000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      });
      if (res.ok) {
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notif.id })
      });
      setNotifications(
        notifications.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'CHANGES_REQUESTED':
        return <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />;
      case 'APPROVED':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
      case 'REVIEW_REQUESTED':
        return <Clock className="h-4 w-4 text-amber-400 shrink-0" />;
      case 'NEW_COMMENT':
        return <MessageSquare className="h-4 w-4 text-purple-400 shrink-0" />;
      default:
        return <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificaciones"
        className="relative p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all shadow-sm group"
      >
        <Bell className="h-4 w-4 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0e1118] border border-zinc-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-zinc-100">
          {/* Dropdown Header */}
          <div className="p-3.5 border-b border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-display">
                Notificaciones
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {unreadCount} nuevas
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="h-3 w-3" />
                <span>Marcar leídas</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-zinc-800/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                <Bell className="h-8 w-8 text-zinc-700 mx-auto mb-2 opacity-50" />
                <p>No tienes notificaciones pendientes.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const date = new Date(n.createdAt);
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 hover:bg-zinc-900/80 cursor-pointer transition-colors flex items-start gap-3 ${
                      !n.read ? 'bg-purple-950/20' : 'opacity-80'
                    }`}
                  >
                    <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-white truncate">
                          {n.title}
                        </p>
                        <span className="text-[10px] text-zinc-500 shrink-0 font-mono">
                          {dateStr} • {timeStr}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      {n.client?.name && (
                        <span className="inline-block text-[9px] font-semibold text-purple-300/90 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                          {n.client.name}
                        </span>
                      )}
                    </div>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-purple-500 shrink-0 mt-1.5 shadow-sm" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Dropdown Footer */}
          <div className="p-2.5 border-t border-zinc-800/80 bg-zinc-950/60 text-center">
            <Link
              href="/parrilla"
              onClick={() => setIsOpen(false)}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center justify-center gap-1 py-1"
            >
              <span>Ir a la Parrilla de Contenidos</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
