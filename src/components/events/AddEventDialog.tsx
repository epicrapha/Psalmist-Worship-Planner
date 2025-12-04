import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Dialog } from '../ui/dialog';
import type { ServicePlan } from '../../types';
import { ChevronDown, Plus, Calendar, Clock } from 'lucide-react';

interface AddEventDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddEventDialog({ isOpen, onClose }: AddEventDialogProps) {
    const { addPlan, team, venues, addVenue, user } = useAppStore();
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('09:00');
    const [venue, setVenue] = useState('');
    const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
    const [showVenuePicker, setShowVenuePicker] = useState(false);
    const [showTeamPicker, setShowTeamPicker] = useState(false);
    const [newVenue, setNewVenue] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dateTime = new Date(`${date}T${time}`);
        const newPlan: ServicePlan = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            date: dateTime.toISOString(),
            leaderId: user?.id || 'unknown',
            items: [],
            team: [],
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
    };

    const handleAddVenue = () => {
        if (newVenue.trim()) {
            addVenue(newVenue.trim());
            setVenue(newVenue.trim());
            setNewVenue('');
            setShowVenuePicker(false);
        }
    };

    const toggleTeamMember = (id: string) => {
        setSelectedTeam(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const closeAllPickers = () => {
        setShowVenuePicker(false);
        setShowTeamPicker(false);
        setShowDatePicker(false);
        setShowTimePicker(false);
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Create New Event">
            <form onSubmit={handleSubmit} className="space-y-5">
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

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                        <label className="text-sm font-medium block">Date</label>
                        <button
                            type="button"
                            onClick={() => { closeAllPickers(); setShowDatePicker(!showDatePicker); }}
                            className="w-full p-3 rounded-lg border border-input bg-background flex items-center justify-between"
                        >
                            <span className={date ? '' : 'text-muted-foreground'}>
                                {date ? new Date(date).toLocaleDateString() : 'Select date'}
                            </span>
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {showDatePicker && (
                            <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg p-3">
                                <input
                                    type="date"
                                    className="w-full p-2 rounded-md border border-input bg-background"
                                    value={date}
                                    onChange={(e) => { setDate(e.target.value); setShowDatePicker(false); }}
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>
                    <div className="space-y-2 relative">
                        <label className="text-sm font-medium block">Time</label>
                        <button
                            type="button"
                            onClick={() => { closeAllPickers(); setShowTimePicker(!showTimePicker); }}
                            className="w-full p-3 rounded-lg border border-input bg-background flex items-center justify-between"
                        >
                            <span>{time}</span>
                            <Clock className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {showTimePicker && (
                            <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg p-3">
                                <input
                                    type="time"
                                    className="w-full p-2 rounded-md border border-input bg-background"
                                    value={time}
                                    onChange={(e) => { setTime(e.target.value); setShowTimePicker(false); }}
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Venue */}
                <div className="space-y-2 relative">
                    <label className="text-sm font-medium block">Venue</label>
                    <button
                        type="button"
                        onClick={() => { closeAllPickers(); setShowVenuePicker(!showVenuePicker); }}
                        className="w-full p-3 rounded-lg border border-input bg-background flex justify-between items-center"
                    >
                        <span className={venue ? '' : 'text-muted-foreground'}>{venue || 'Select venue'}</span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>
                    {showVenuePicker && (
                        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg p-3 max-h-48 overflow-y-auto">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {venues.map(v => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => { setVenue(v); setShowVenuePicker(false); }}
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
                        onClick={() => { closeAllPickers(); setShowTeamPicker(!showTeamPicker); }}
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
                    {showTeamPicker && (
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
                        className="px-6 py-2.5 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                        Create Event
                    </button>
                </div>
            </form>
        </Dialog>
    );
}
