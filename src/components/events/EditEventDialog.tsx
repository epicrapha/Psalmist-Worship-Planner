import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Dialog } from '../ui/dialog';
import type { ServicePlan } from '../../types';
import { ChevronDown, Plus, Calendar, Clock, Trash2 } from 'lucide-react';
import { ColorIconPicker } from '../ui/ColorIconPicker';

interface EditEventDialogProps {
    isOpen: boolean;
    onClose: () => void;
    event: ServicePlan;
}

export function EditEventDialog({ isOpen, onClose, event }: EditEventDialogProps) {
    const { updatePlan, deletePlan, teams, currentTeamId, addVenue } = useAppStore();
    const currentTeam = teams.find(t => t.id === currentTeamId);
    const venues = currentTeam?.venues || [];
    const eventDate = new Date(event.date);
    const [title, setTitle] = useState(event.title);
    const [date, setDate] = useState(eventDate.toISOString().split('T')[0]);
    const [time, setTime] = useState(eventDate.toTimeString().slice(0, 5));
    const [venue, setVenue] = useState('');
    const [newVenue, setNewVenue] = useState('');
    const [activePicker, setActivePicker] = useState<'none' | 'venue'>('none');

    // Customization
    const [color, setColor] = useState(event.color || 'bg-blue-500');
    const [icon, setIcon] = useState(event.icon || 'Calendar');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dateTime = new Date(`${date}T${time}`);
        updatePlan(event.id, {
            title,
            date: dateTime.toISOString(),
            color,
            icon,
        });
        onClose();
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
            deletePlan(event.id);
            onClose();
        }
    };

    const handleAddVenue = () => {
        if (newVenue.trim()) {
            addVenue(newVenue.trim());
            setVenue(newVenue.trim());
            setNewVenue('');
            setActivePicker('none');
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Edit Event">
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div className="space-y-2">
                    <label className="text-sm font-medium block">Event Title</label>
                    <input
                        required
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

                <div className="pt-4 flex justify-between items-center">
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="p-2.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2.5 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </Dialog>
    );
}
