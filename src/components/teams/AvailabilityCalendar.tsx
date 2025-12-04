import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import type { TeamMember } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface AvailabilityCalendarProps {
    team: TeamMember[];
}

export function AvailabilityCalendar({ team }: AvailabilityCalendarProps) {
    const { updateTeamMember, user } = useAppStore();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad with days from previous month to start on Sunday
    const startDay = monthStart.getDay();
    const paddedDays = Array(startDay).fill(null).concat(days);

    const getAvailabilityForDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return team.map(member => ({
            member,
            status: member.availability[dateStr] as string | undefined || 'unknown'
        }));
    };

    const toggleMyAvailability = (date: Date) => {
        if (!user) return;
        const dateStr = format(date, 'yyyy-MM-dd');
        const currentMember = team.find(m => m.id === user.id);
        if (!currentMember) return;

        const currentStatus = currentMember.availability[dateStr];
        const nextStatus = currentStatus === 'available' ? 'unavailable'
            : currentStatus === 'unavailable' ? 'maybe'
                : 'available';

        updateTeamMember(user.id, {
            availability: { ...currentMember.availability, [dateStr]: nextStatus }
        });
    };

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
                <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-px bg-border">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-secondary/50 p-2 text-center text-xs font-medium text-muted-foreground">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-border">
                {paddedDays.map((day, i) => {
                    if (!day) {
                        return <div key={`empty-${i}`} className="bg-background p-2 min-h-[60px]" />;
                    }

                    const isToday = isSameDay(day, new Date());
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const availability = getAvailabilityForDate(day);
                    const availableCount = availability.filter(a => a.status === 'available').length;
                    const unavailableCount = availability.filter(a => a.status === 'unavailable').length;

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => setSelectedDate(day)}
                            onDoubleClick={() => toggleMyAvailability(day)}
                            className={`bg-background p-2 min-h-[60px] text-left transition-colors hover:bg-secondary/50 ${isSelected ? 'ring-2 ring-primary ring-inset' : ''}`}
                        >
                            <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                                {format(day, 'd')}
                            </div>
                            {availableCount > 0 && (
                                <div className="text-[10px] text-emerald-500 font-medium">{availableCount} ✓</div>
                            )}
                            {unavailableCount > 0 && (
                                <div className="text-[10px] text-destructive font-medium">{unavailableCount} ✗</div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selected date details */}
            {selectedDate && (
                <div className="p-4 border-t border-border">
                    <h4 className="font-medium mb-3">{format(selectedDate, 'EEEE, MMMM d')}</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {getAvailabilityForDate(selectedDate).map(({ member, status }) => (
                            <div key={member.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full" />
                                    <span>{member.name}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status === 'available' ? 'bg-emerald-500/10 text-emerald-500' :
                                    status === 'unavailable' ? 'bg-destructive/10 text-destructive' :
                                        status === 'maybe' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-secondary text-muted-foreground'
                                    }`}>
                                    {status === 'unknown' ? 'Not set' : status}
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Double-click a date to toggle your availability</p>
                </div>
            )}
        </div>
    );
}
