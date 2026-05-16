'use client'

import { useEffect, useRef, useState } from 'react'
import { format, isToday } from 'date-fns'
import type { CalendarEvent } from '@/lib/types'
import EventBlock from './EventBlock'
import {
  HOUR_HEIGHT, TIME_START, TIME_END,
  getWeekDays, getEventsForDay, getDayStatus, getDayWeight,
  getCurrentTimePosition, hours,
} from '@/lib/utils'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TOTAL_HEIGHT = (TIME_END - TIME_START) * HOUR_HEIGHT

interface Props {
  events: CalendarEvent[]
  weekDate: Date
  onDelete: (id: string) => void
}

export default function WeekView({ events, weekDate, onDelete }: Props) {
  const days         = getWeekDays(weekDate)
  const timeRef      = useRef<HTMLDivElement>(null)
  const [timeLine, setTimeLine] = useState(getCurrentTimePosition())

  useEffect(() => {
    const interval = setInterval(() => setTimeLine(getCurrentTimePosition()), 30_000)
    return () => clearInterval(interval)
  }, [])

  // Scroll current time into view on mount
  useEffect(() => {
    if (timeRef.current) {
      timeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  const dayEventMap = days.map(d => getEventsForDay(events, d))
  const weights     = dayEventMap.map(getDayWeight)
  const gridCols    = weights.map(w => `${w}fr`).join(' ')

  const todayIndex  = days.findIndex(d => isToday(d))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Day header */}
      <div className="flex flex-shrink-0" style={{ paddingLeft: 52 }}>
        <div
          className="grid flex-1"
          style={{ gridTemplateColumns: gridCols }}
        >
          {days.map((day, i) => {
            const status = getDayStatus(day)
            const isT    = status === 'today'
            return (
              <div
                key={i}
                className="flex flex-col items-center py-3 border-b border-r border-[#1e1e3a] last:border-r-0
                           transition-colors duration-500"
                style={{
                  background: isT ? 'rgba(124,58,237,0.06)' : 'transparent',
                }}
              >
                <span
                  className="text-[10px] font-semibold tracking-widest uppercase mb-1"
                  style={{
                    color: isT ? '#8b5cf6' : status === 'past' ? '#3a3a5c' : '#5050a0',
                  }}
                >
                  {DAY_LABELS[i]}
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                             transition-all duration-300"
                  style={{
                    background:  isT ? '#7c3aed' : 'transparent',
                    color:       isT ? '#ffffff' : status === 'past' ? '#3a3a5c' : '#c8c8f0',
                    boxShadow:   isT ? '0 0 16px rgba(124,58,237,0.5)' : 'none',
                  }}
                >
                  {format(day, 'd')}
                </div>
                <span
                  className="text-[9px] mt-0.5"
                  style={{ color: status === 'past' ? '#2a2a44' : '#3a3a5c' }}
                >
                  {format(day, 'MMM')}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Scrollable grid */}
      <div className="flex flex-1 overflow-y-auto scrollbar-hide">
        {/* Time column */}
        <div className="flex-shrink-0 w-[52px] relative" style={{ height: TOTAL_HEIGHT }}>
          {hours().map(h => (
            <div
              key={h}
              className="absolute w-full flex items-start justify-end pr-2"
              style={{ top: (h - TIME_START) * HOUR_HEIGHT - 8, height: HOUR_HEIGHT }}
            >
              <span className="text-[10px] font-mono text-[#2e2e50]">
                {h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`}
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div
          className="flex-1 grid relative"
          style={{ gridTemplateColumns: gridCols, height: TOTAL_HEIGHT }}
        >
          {/* Hour grid lines */}
          {hours().map(h => (
            <div
              key={h}
              className="absolute left-0 right-0 border-t border-[#1a1a30]"
              style={{ top: (h - TIME_START) * HOUR_HEIGHT }}
            />
          ))}

          {/* Half-hour lines */}
          {hours().map(h => (
            <div
              key={`h-${h}`}
              className="absolute left-0 right-0 border-t border-[#131325]"
              style={{ top: (h - TIME_START) * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
            />
          ))}

          {/* Day columns */}
          {days.map((day, i) => {
            const status     = getDayStatus(day)
            const dayEvents  = dayEventMap[i]
            const isT        = status === 'today'

            return (
              <div
                key={i}
                className="relative border-r border-[#1a1a30] last:border-r-0"
                style={{
                  background: isT
                    ? 'linear-gradient(180deg, rgba(124,58,237,0.04) 0%, transparent 100%)'
                    : 'transparent',
                  height: TOTAL_HEIGHT,
                }}
              >
                {/* Past overlay */}
                {status === 'past' && (
                  <div
                    className="absolute inset-0 pointer-events-none z-20"
                    style={{ background: 'rgba(6,6,15,0.45)' }}
                  />
                )}

                {dayEvents.map(ev => (
                  <EventBlock
                    key={ev.id}
                    event={ev}
                    isPast={status === 'past'}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )
          })}

          {/* Current time indicator */}
          {todayIndex >= 0 && timeLine >= 0 && timeLine <= TOTAL_HEIGHT && (
            <div
              ref={timeRef}
              className="absolute z-30 pointer-events-none"
              style={{
                top: timeLine,
                left: `calc(${
                  weights.slice(0, todayIndex).reduce((a, b) => a + b, 0) /
                  weights.reduce((a, b) => a + b, 0) * 100
                }%)`,
                width: `calc(${weights[todayIndex] / weights.reduce((a, b) => a + b, 0) * 100}%)`,
              }}
            >
              <div className="flex items-center">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 -ml-1.5"
                  style={{
                    background: '#f87171',
                    boxShadow: '0 0 8px rgba(248,113,113,0.8)',
                  }}
                />
                <div
                  className="flex-1 h-px"
                  style={{
                    background: 'linear-gradient(90deg, #f87171 0%, rgba(248,113,113,0) 100%)',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
