'use client'

import { useState } from 'react'
import { X, Users, Clock, AlignLeft } from 'lucide-react'
import type { CalendarEvent } from '@/lib/types'
import {
  CATEGORY_BG, CATEGORY_COLORS,
  formatDisplayTime, cleanTitle, getEventPosition,
} from '@/lib/utils'

interface Props {
  event: CalendarEvent
  isPast: boolean
  onDelete: (id: string) => void
}

export default function EventBlock({ event, isPast, onDelete }: Props) {
  const [showDetail, setShowDetail] = useState(false)
  const { top, height } = getEventPosition(event.startTime, event.endTime)
  const color   = CATEGORY_COLORS[event.category] ?? event.color
  const bgColor = CATEGORY_BG[event.category]     ?? 'rgba(129,140,248,0.11)'
  const title   = cleanTitle(event.title)
  const isShort = height < 56

  return (
    <>
      <div
        className="absolute left-1 right-1 rounded-lg overflow-hidden cursor-pointer group
                   transition-all duration-200 hover:z-30 hover:scale-[1.02] hover:shadow-lg"
        style={{
          top,
          height,
          background: bgColor,
          borderLeft: `3px solid ${color}`,
          boxShadow: `0 2px 8px rgba(0,0,0,0.25)`,
          filter: isPast ? 'saturate(0.4) brightness(0.65)' : undefined,
          zIndex: 10,
        }}
        onClick={() => setShowDetail(true)}
      >
        <div className="p-1.5 h-full flex flex-col overflow-hidden">
          <p
            className="text-xs font-semibold leading-tight truncate"
            style={{ color }}
          >
            {title}
          </p>
          {!isShort && (
            <p className="text-[10px] mt-0.5 leading-tight truncate"
               style={{ color: `${color}aa` }}>
              {formatDisplayTime(event.startTime)}
              {event.attendees.length > 0 && ` · ${event.attendees[0]}`}
            </p>
          )}
          {height > 80 && event.summary && (
            <p className="text-[10px] mt-1 leading-snug line-clamp-2"
               style={{ color: `${color}88` }}>
              {event.summary}
            </p>
          )}
        </div>

        <button
          onClick={e => { e.stopPropagation(); onDelete(event.id) }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100
                     transition-opacity w-4 h-4 rounded flex items-center justify-center
                     bg-black/40 hover:bg-red-500/60"
        >
          <X size={9} className="text-white" />
        </button>
      </div>

      {showDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="relative w-[340px] rounded-2xl p-5 shadow-2xl animate-slide-up"
            style={{
              background: 'rgba(14,14,30,0.97)',
              border: `1px solid ${color}44`,
              boxShadow: `0 0 40px ${color}22`,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="w-8 h-1 rounded-full mb-4"
              style={{ background: color }}
            />

            <h2 className="text-lg font-bold text-[#e2e2ff] leading-tight mb-1">
              {title}
            </h2>

            <div className="flex items-center gap-1.5 mb-3">
              <Clock size={12} className="text-[#5050a0]" />
              <span className="text-xs text-[#7070a0]">
                {formatDisplayTime(event.startTime)} – {formatDisplayTime(event.endTime)}
              </span>
              <span
                className="ml-2 text-[10px] px-2 py-0.5 rounded-full font-medium capitalize"
                style={{ background: bgColor, color }}
              >
                {event.category}
              </span>
            </div>

            {event.attendees.length > 0 && (
              <div className="flex items-start gap-1.5 mb-3">
                <Users size={12} className="text-[#5050a0] mt-0.5" />
                <p className="text-xs text-[#9090c0]">
                  {event.attendees.join(', ')}
                </p>
              </div>
            )}

            {event.summary && (
              <div className="flex items-start gap-1.5 mb-4">
                <AlignLeft size={12} className="text-[#5050a0] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#7070a0] leading-relaxed">{event.summary}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowDetail(false)}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-[#7070a0]
                           bg-white/5 hover:bg-white/10 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => { onDelete(event.id); setShowDetail(false) }}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-red-400
                           bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
