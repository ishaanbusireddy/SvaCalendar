'use client'

import { useState, useEffect } from 'react'
import { format, addWeeks, subWeeks, isToday, startOfWeek } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import type { CalendarEvent } from '@/lib/types'
import AISidebar from '@/components/AISidebar'
import WeekView from '@/components/WeekView'
import { getWeekDays } from '@/lib/utils'

const STORAGE_KEY   = 'svacalendar_events'
const API_KEY_KEY   = 'svacalendar_apikey'

function loadEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

function saveEvents(events: CalendarEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
}

export default function CalendarApp() {
  const [events,    setEvents]    = useState<CalendarEvent[]>([])
  const [weekDate,  setWeekDate]  = useState(new Date())
  const [apiKey,    setApiKey]    = useState('')
  const [mounted,   setMounted]   = useState(false)

  useEffect(() => {
    setEvents(loadEvents())
    setApiKey(localStorage.getItem(API_KEY_KEY) || '')
    setMounted(true)
  }, [])

  function handleApiKeyChange(key: string) {
    setApiKey(key)
    localStorage.setItem(API_KEY_KEY, key)
  }

  function handleEventAdded(event: CalendarEvent) {
    setEvents(prev => {
      const next = [...prev, event]
      saveEvents(next)
      return next
    })
  }

  function handleEventDelete(id: string) {
    setEvents(prev => {
      const next = prev.filter(e => e.id !== id)
      saveEvents(next)
      return next
    })
  }

  function handleWeekChange(date: Date) {
    setWeekDate(date)
  }

  const days = getWeekDays(weekDate)
  const weekStart = days[0]
  const weekEnd   = days[6]

  const weekLabel = format(weekStart, 'MMM d') === format(weekEnd, 'MMM d').split(' ')[0]
    ? `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'd, yyyy')}`
    : `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`

  const isCurrentWeek = (() => {
    const todayWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const viewWeekStart  = format(startOfWeek(weekDate,  { weekStartsOn: 1 }), 'yyyy-MM-dd')
    return todayWeekStart === viewWeekStart
  })()

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#06060f]">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-violet-700 animate-thinking"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#06060f]">
      <AISidebar
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
        onEventAdded={handleEventAdded}
        onWeekChange={handleWeekChange}
        currentWeek={weekDate}
      />

      <main className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-3.5 border-b border-[#1e1e3a] flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setWeekDate(d => subWeeks(d, 1))}
              className="p-1.5 rounded-lg text-[#3a3a5c] hover:text-[#8080c0] hover:bg-white/5
                         transition-all duration-200"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setWeekDate(d => addWeeks(d, 1))}
              className="p-1.5 rounded-lg text-[#3a3a5c] hover:text-[#8080c0] hover:bg-white/5
                         transition-all duration-200"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-baseline gap-3">
            <h2 className="text-sm font-semibold text-[#c8c8f0]">{weekLabel}</h2>
            {isCurrentWeek && (
              <span
                className="text-[9px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(124,58,237,0.15)',
                  color: '#8b5cf6',
                  border: '1px solid rgba(124,58,237,0.25)',
                }}
              >
                This week
              </span>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] text-[#2e2e4e]">
              {events.length} event{events.length !== 1 ? 's' : ''}
            </span>
            {!isCurrentWeek && (
              <button
                onClick={() => setWeekDate(new Date())}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold
                           text-[#7070a0] border border-[#2a2a4a] hover:border-[#4a4a7a]
                           hover:text-[#a0a0d0] transition-all duration-200"
              >
                <Calendar size={10} />
                Today
              </button>
            )}
          </div>
        </header>

        {/* Calendar grid */}
        <div className="flex-1 overflow-hidden">
          <WeekView
            events={events}
            weekDate={weekDate}
            onDelete={handleEventDelete}
          />
        </div>
      </main>
    </div>
  )
}
