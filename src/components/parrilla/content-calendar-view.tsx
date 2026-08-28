'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Film,
  Layers,
  Image as ImageIcon,
  Video,
  Share2,
  AlertCircle,
  CheckCircle2,
  Instagram,
  Facebook,
  Linkedin
} from 'lucide-react';
import { ContentPost, STATUS_CONFIG } from './types';
import { Badge } from '@/components/ui/badge';

interface ContentCalendarViewProps {
  currentDate: Date;
  onDateChange: (d: Date) => void;
  posts: ContentPost[];
  onSelectPost: (p: ContentPost) => void;
  onNewPostAtDate: (dateStr: string) => void;
}

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const FORMAT_ICONS: Record<string, any> = {
  REEL: Film,
  CAROUSEL: Layers,
  IMAGE: ImageIcon,
  STORY: Clock,
  VIDEO: Video,
  TIKTOK: Share2
};

export function ContentCalendarView({
  currentDate,
  onDateChange,
  posts,
  onSelectPost,
  onNewPostAtDate
}: ContentCalendarViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day of week index for 1st day (0 = Sunday in JS, we convert to Monday = 0)
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  const totalDays = lastDayOfMonth.getDate();

  const prevMonth = () => {
    onDateChange(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    onDateChange(new Date(year, month + 1, 1));
  };

  const setToday = () => {
    onDateChange(new Date());
  };

  const monthName = currentDate.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  });

  // Calendar cells
  const calendarCells = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarCells.push(d);
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDateNumber = today.getDate();

  return (
    <div className="bg-[#0b0e14] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
      {/* Calendar Header Navigation */}
      <div className="p-4 sm:px-6 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 bg-zinc-900/40">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-white capitalize font-display">
            {monthName}
          </h3>
          <span className="text-xs text-zinc-400 bg-zinc-800/80 px-2.5 py-0.5 rounded-full border border-zinc-700">
            {posts.length} {posts.length === 1 ? 'publicación' : 'publicaciones'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={setToday}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            Hoy
          </button>
          <div className="flex items-center rounded-lg bg-zinc-900 border border-zinc-800 p-0.5">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Mes Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Mes Siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 border-b border-zinc-800/80 bg-zinc-950/60 text-center text-xs font-semibold text-zinc-400 py-2.5">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr gap-px bg-zinc-800/40">
        {calendarCells.map((dayNum, index) => {
          if (dayNum === null) {
            return (
              <div
                key={`empty-${index}`}
                className="bg-[#090b10]/40 min-h-[120px] p-2 opacity-30"
              />
            );
          }

          const isToday = isCurrentMonth && dayNum === todayDateNumber;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

          // Filter posts matching this specific date
          const dayPosts = posts.filter((p) => {
            const pDate = new Date(p.scheduledDate);
            return (
              pDate.getFullYear() === year &&
              pDate.getMonth() === month &&
              pDate.getDate() === dayNum
            );
          });

          return (
            <div
              key={`day-${dayNum}`}
              className={`bg-[#0c0f17] min-h-[135px] p-2 flex flex-col group relative transition-colors hover:bg-zinc-900/50 ${
                isToday ? 'ring-1 ring-inset ring-purple-500/50 bg-purple-950/10' : ''
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-zinc-400 group-hover:text-zinc-200'
                  }`}
                >
                  {dayNum}
                </span>

                {/* Quick Add Button on Hover */}
                <button
                  onClick={() => onNewPostAtDate(dateStr)}
                  title="Planificar publicación este día"
                  className="opacity-0 group-hover:opacity-100 p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white hover:bg-purple-600 transition-all"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {/* Posts for this Day */}
              <div className="space-y-1.5 overflow-y-auto flex-1 max-h-[160px] scrollbar-thin">
                {dayPosts.map((post) => {
                  const cfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.BORRADOR;
                  const Icon = FORMAT_ICONS[post.contentType] || ImageIcon;
                  const pTime = new Date(post.scheduledDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={post.id}
                      onClick={() => onSelectPost(post)}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${cfg.bg} ${cfg.border} group/card`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1">
                          <Icon className={`h-3 w-3 ${cfg.text}`} />
                          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider truncate max-w-[60px]">
                            {post.contentType}
                          </span>
                        </div>
                        <span className="text-[9px] text-zinc-400 font-mono">
                          {pTime}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-zinc-100 line-clamp-2 leading-snug">
                        {post.title}
                      </p>

                      {/* Platforms & Status Dot */}
                      <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-zinc-800/40">
                        <span className={`text-[9px] font-semibold truncate ${cfg.text}`}>
                          {cfg.label}
                        </span>

                        {post.comments && post.comments.length > 0 && (
                          <span className="text-[9px] text-zinc-400 font-medium">
                            💬 {post.comments.length}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
