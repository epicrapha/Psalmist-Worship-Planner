import { Plus, CalendarPlus, UserCheck, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddSongDialog } from './AddSongDialog';
import { AddEventDialog } from '../events/AddEventDialog';
import { InviteMemberDialog } from '../teams/InviteMemberDialog';

export function QuickActions() {
    const navigate = useNavigate();
    const [showAddSong, setShowAddSong] = useState(false);
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [showAddTeam, setShowAddTeam] = useState(false);

    const actions = [
        {
            icon: Plus,
            label: 'Add Song',
            color: 'bg-blue-500',
            onClick: () => setShowAddSong(true)
        },
        {
            icon: CalendarPlus,
            label: 'New Event',
            color: 'bg-emerald-500',
            onClick: () => setShowAddEvent(true)
        },
        {
            icon: Users,
            label: 'New Team',
            color: 'bg-violet-500',
            onClick: () => setShowAddTeam(true)
        },
        {
            icon: UserCheck,
            label: 'Availability',
            color: 'bg-amber-500',
            onClick: () => navigate('/teams')
        },
    ];

    return (
        <>
            <div className="flex justify-between items-start px-2">
                {actions.map(({ icon: Icon, label, color, onClick }) => (
                    <button
                        key={label}
                        onClick={onClick}
                        className="flex flex-col items-center space-y-2 group"
                    >
                        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg shadow-black/5 transition-transform active:scale-95 group-hover:scale-105`}>
                            <Icon className="w-7 h-7" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                            {label}
                        </span>
                    </button>
                ))}
            </div>

            <AddSongDialog isOpen={showAddSong} onClose={() => setShowAddSong(false)} />
            <AddEventDialog isOpen={showAddEvent} onClose={() => setShowAddEvent(false)} />
            <InviteMemberDialog isOpen={showAddTeam} onClose={() => setShowAddTeam(false)} />
        </>
    );
}
