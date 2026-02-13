
'use client'

import React, { useState } from 'react'
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SearchCalendarProps {
    searches: any[]
}

export function SearchCalendar({ searches }: SearchCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between px-2 py-4">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold uppercase tracking-wider">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h3>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        return (
            <div className="grid grid-cols-7 border-b bg-muted/30">
                {days.map((day) => (
                    <div key={day} className="py-2 text-center text-xs font-bold text-muted-foreground uppercase">
                        {day}
                    </div>
                ))}
            </div>
        )
    }

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(monthStart)
        const startDate = startOfWeek(monthStart)
        const endDate = endOfWeek(monthEnd)

        const rows = []
        let days = []
        let day = startDate
        let formattedDate = ""

        const allDays = eachDayOfInterval({ start: startDate, end: endDate })

        return (
            <div className="grid grid-cols-7 border-l border-t">
                {allDays.map((d, i) => {
                    const daySearches = searches.filter(s => isSameDay(new Date(s.date), d))
                    const isOutside = !isSameMonth(d, monthStart)
                    const isToday = isSameDay(d, new Date())

                    return (
                        <div
                            key={i}
                            className={cn(
                                "min-h-[120px] border-r border-b p-2 transition-colors",
                                isOutside ? "bg-muted/10 text-muted-foreground/50" : "bg-background",
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <span className={cn(
                                    "text-sm font-medium flex items-center justify-center h-6 w-6 rounded-full",
                                    isToday && "bg-primary text-primary-foreground"
                                )}>
                                    {format(d, 'd')}
                                </span>
                            </div>
                            <div className="mt-2 space-y-1">
                                {daySearches.map((search) => (
                                    <Link
                                        key={search.id}
                                        href={`/dashboard/searches/${search.id}`}
                                        className="group block"
                                    >
                                        <div className={cn(
                                            "text-[10px] p-1 rounded border truncate transition-all duration-200",
                                            search.status === 'ACTIVE'
                                                ? "bg-blue-50 border-blue-200 text-blue-700 font-medium group-hover:bg-blue-100"
                                                : search.status === 'COMPLETED'
                                                    ? "bg-green-50 border-green-200 text-green-700 group-hover:bg-green-100"
                                                    : "bg-slate-50 border-slate-200 text-slate-700 group-hover:bg-slate-100"
                                        )}>
                                            {search.name}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="rounded-lg border shadow-sm flex flex-col overflow-hidden bg-card">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    )
}
