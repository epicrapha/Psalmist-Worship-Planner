import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import type { ServicePlan } from '../../types';
import { cn } from '../../lib/utils';
import * as Icons from 'lucide-react';

interface EventsCalendarProps {
    plans: ServicePlan[];
    onSelectEvent: (plan: ServicePlan) => void;
    onAddEvent: (date: Date) => void;
}

export function EventsCalendar({ plans, onSelectEvent, onAddEvent }: EventsCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad with days from previous month to start on Sunday
    const startDay = monthStart.getDay();
    const paddedDays = Array(startDay).fill(null).concat(days);

    const getEventsForDate = (date: Date) => {
        return plans.filter(plan => isSameDay(parseISO(plan.date), date))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    return (
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                    <div className="flex items-center bg-secondary rounded-lg p-1">
                        <button
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="p-1.5 hover:bg-background rounded-md transition-all shadow-sm hover:shadow"
                        >
                            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <button
                            onClick={() => setCurrentMonth(new Date())}
                            className="px-3 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="p-1.5 hover:bg-background rounded-md transition-all shadow-sm hover:shadow"
                        >
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-px bg-border/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-card/50 p-2 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-border/50">
                {paddedDays.map((day, i) => {
                    if (!day) {
                        return <div key={`empty-${i}`} className="bg-card/30 min-h-[120px]" />;
                    }

                    const isToday = isSameDay(day, new Date());
                    const dayEvents = getEventsForDate(day);

                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "group bg-card min-h-[120px] p-2 transition-colors hover:bg-secondary/10 relative",
                                isToday && "bg-secondary/5"
                            )}
                            onClick={() => onAddEvent(day)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={cn(
                                    "w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium transition-all",
                                    isToday
                                        ? "bg-primary text-primary-foreground shadow-md scale-110"
                                        : "text-muted-foreground group-hover:bg-secondary group-hover:text-foreground"
                                )}>
                                    {format(day, 'd')}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddEvent(day);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/10 text-primary rounded-md transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-1.5">
                                {dayEvents.map(event => {
                                    const Icon = ((event.icon && (Icons as any)[event.icon]) || CalendarIcon);
                                    return (
                                        <button
                                            key={event.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectEvent(event);
                                            }}
                                            className={cn(
                                                "w-full text-left px-2 py-1.5 rounded-md text-xs font-medium truncate flex items-center gap-1.5 transition-all hover:scale-[1.02] hover:shadow-sm",
                                                event.color
                                                    ? event.color.replace('bg-', 'bg-opacity-10 bg-').replace('text-', 'text-') + ' border border-' + event.color.replace('bg-', '') + '/20'
                                                    : "bg-primary/10 text-primary border border-primary/20"
                                            )}
                                        >
                                            <Icon className="w-3 h-3 flex-shrink-0 opacity-70" />
                                            <span className="truncate">{event.title}</span>
                                        </button>
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
