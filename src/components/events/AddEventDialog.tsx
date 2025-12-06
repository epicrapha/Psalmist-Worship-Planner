import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Dialog } from '../ui/dialog';
import type { ServicePlan } from '../../types';
import { ChevronDown, Plus, Calendar, Clock } from 'lucide-react';
import { ColorIconPicker } from '../ui/ColorIconPicker';

interface AddEventDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate?: string;
}

export function AddEventDialog({ isOpen, onClose, initialDate }: AddEventDialogProps) {
    const { addPlan, teams, currentTeamId, addVenue, user } = useAppStore();
    const currentTeam = teams.find(t => t.id === currentTeamId);
    const team = currentTeam?.members || [];
    const venues = currentTeam?.venues || [];
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('09:00');
    const [venue, setVenue] = useState('');
    const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
    const [newVenue, setNewVenue] = useState('');

    // Customization
    const [color, setColor] = useState('bg-blue-500');
    const [icon, setIcon] = useState('Calendar');

    // UI State for pickers - using simplified logic to avoid clicks closing immediately
    const [activePicker, setActivePicker] = useState<'none' | 'venue' | 'team'>('none');

    useEffect(() => {
        if (isOpen && initialDate) {
            setDate(initialDate);
        } else if (isOpen && !date) {
            // Only reset if empty and no initial date, or keep previous logic?
            // Actually, let's just respect initialDate if provided when opening
        }
    }, [isOpen, initialDate]);

    const wrapperRef = useRef<HTMLFormElement>(null);

    // Click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                // Don't close if clicking inside a dialog portal (implied)
                // For now, simpler: let interactions handle their own close
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dateTime = new Date(`${date}T${time}`);
        // Map selected IDs to team objects with default role
        const teamAssignments = selectedTeam.map(memberId => {
            const member = team.find(m => m.id === memberId);
            return {
                memberId,
                role: member?.roles?.[0] || 'Member'
            };
        });

        const newPlan: ServicePlan = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            date: dateTime.toISOString(),
            leaderId: user?.id || 'unknown',
            items: [],
            team: teamAssignments,
            color,
            icon,
        };
        addPlan(newPlan);
        onClose();
        resetForm();
    };

    const resetForm = () => {
        setTitle('');
        setDate('');
        setTime('09:00');
        setVenue('');
        setSelectedTeam([]);
        setColor('bg-blue-500');
        setIcon('Calendar');
        setActivePicker('none');
    };

    const handleAddVenue = () => {
        if (newVenue.trim()) {
            addVenue(newVenue.trim());
            setVenue(newVenue.trim());
            setNewVenue('');
            setActivePicker('none');
        }
    };

    const toggleTeamMember = (id: string) => {
        setSelectedTeam(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Create New Event">
            <form onSubmit={handleSubmit} className="space-y-5" ref={wrapperRef}>
                {/* Title */}
                <div className="space-y-2">
                    <label className="text-sm font-medium block">Event Title</label>
                    <input
                        required
                        placeholder="e.g. Sunday Service"
                        className="w-full p-3 rounded-lg border border-input bg-background"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* Appearance */}
                <ColorIconPicker
                    color={color}
                    icon={icon}
                    onColorChange={setColor}
                    onIconChange={setIcon}
                />

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium block">Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                required
                                className="w-full p-3 rounded-lg border border-input bg-background [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                            <Calendar className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium block">Time</label>
                        <div className="relative">
                            <input
                                type="time"
                                required
                                className="w-full p-3 rounded-lg border border-input bg-background [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                            <Clock className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Venue */}
                <div className="space-y-2 relative">
                    <label className="text-sm font-medium block">Venue</label>
                    <button
                        type="button"
                        onClick={() => setActivePicker(activePicker === 'venue' ? 'none' : 'venue')}
                        className="w-full p-3 rounded-lg border border-input bg-background flex justify-between items-center"
                    >
                        <span className={venue ? '' : 'text-muted-foreground'}>{venue || 'Select venue'}</span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>
                    {activePicker === 'venue' && (
                        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg p-3 max-h-48 overflow-y-auto">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {venues.map(v => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => { setVenue(v); setActivePicker('none'); }}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${venue === v ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t border-border">
                                <input
                                    type="text"
                                    placeholder="Add new venue..."
                                    className="flex-1 p-2 rounded-md border border-input bg-background text-sm"
                                    value={newVenue}
                                    onChange={(e) => setNewVenue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVenue())}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddVenue}
                                    className="p-2 bg-primary text-primary-foreground rounded-md"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Team */}
                <div className="space-y-2 relative">
                    <label className="text-sm font-medium block">Team Members</label>
                    <button
                        type="button"
                        onClick={() => setActivePicker(activePicker === 'team' ? 'none' : 'team')}
                        className="w-full p-3 rounded-lg border border-input bg-background flex justify-between items-center"
                    >
                        <div className="flex flex-wrap gap-1">
                            {selectedTeam.length > 0 ? (
                                selectedTeam.map(id => {
                                    const member = team.find(m => m.id === id);
                                    return member ? (
                                        <span key={id} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{member.name}</span>
                                    ) : null;
                                })
                            ) : (
                                <span className="text-muted-foreground">Select team members</span>
                            )}
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </button>
                    {activePicker === 'team' && (
                        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg p-3 max-h-48 overflow-y-auto">
                            <div className="space-y-2">
                                {team.map(member => (
                                    <button
                                        key={member.id}
                                        type="button"
                                        onClick={() => toggleTeamMember(member.id)}
                                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${selectedTeam.includes(member.id) ? 'bg-primary/10' : 'hover:bg-secondary'}`}
                                    >
                                        <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full" />
                                        <div className="text-left flex-1">
                                            <div className="font-medium text-sm">{member.name}</div>
                                            <div className="text-xs text-muted-foreground">{member.roles?.[0] || 'Member'}</div>
                                        </div>
                                        {selectedTeam.includes(member.id) && (
                                            <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">✓</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={!title || !date || !time}
                        className="px-6 py-2.5 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                        Create Event
                    </button>
                </div>
            </form>
        </Dialog>
    );
}
