import { useState } from 'react';
import { Dialog } from '../ui/dialog';
import { useAppStore } from '../../store/useAppStore';
import type { Team } from '../../types';
import { ChevronDown, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';

// Common colors for teams
const COLORS = [
    { name: 'Blue', value: 'bg-blue-500' },
    { name: 'Green', value: 'bg-emerald-500' },
    { name: 'Purple', value: 'bg-purple-500' },
    { name: 'Orange', value: 'bg-orange-500' },
    { name: 'Pink', value: 'bg-pink-500' },
    { name: 'Red', value: 'bg-red-500' },
    { name: 'Yellow', value: 'bg-yellow-500' },
    { name: 'Indigo', value: 'bg-indigo-500' },
];

const ICONS = ['Music', 'Users', 'Church', 'Mic2', 'Guitar', 'Piano', 'Drum', 'Heart', 'Star', 'Zap'];

interface CreateTeamDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateTeamDialog({ isOpen, onClose }: CreateTeamDialogProps) {
    const { addTeam, user } = useAppStore();
    const [name, setName] = useState('');
    const [color, setColor] = useState(COLORS[0].value);
    const [icon, setIcon] = useState('Music');
    const [showIconPicker, setShowIconPicker] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newTeam: Team = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            icon,
            color,
            members: user ? [{ ...user, roles: ['admin'], availability: {} }] : [], // Add creator as admin
            roles: [], // Should probably add default roles here
            roleGroups: [],
            admins: user ? [user.id] : [],
            plans: [],
            songs: [],
            venues: [],
            customTags: [],
        };
        addTeam(newTeam);
        onClose();
        setName('');
        setColor(COLORS[0].value);
        setIcon('Music');
    };

    const IconComponent = (Icons as any)[icon] || Icons.Music;

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Create New Team">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-medium block">Team Name</label>
                    <input
                        required
                        placeholder="e.g. Worship Team"
                        className="w-full p-3 rounded-lg border border-input bg-background"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium block">Color</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setColor(c.value)}
                                    className={`w-8 h-8 rounded-full ${c.value} transition-transform ${color === c.value ? 'scale-110 ring-2 ring-offset-2 ring-primary' : 'hover:scale-105'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2 relative">
                        <label className="text-sm font-medium block">Icon</label>
                        <button
                            type="button"
                            onClick={() => setShowIconPicker(!showIconPicker)}
                            className="w-full p-3 rounded-lg border border-input bg-background flex justify-between items-center"
                        >
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-md ${color} text-white`}>
                                    <IconComponent className="w-4 h-4" />
                                </div>
                                <span>{icon}</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {showIconPicker && (
                            <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg p-3 max-h-48 overflow-y-auto grid grid-cols-4 gap-2">
                                {ICONS.map((iconName) => {
                                    const Icon = (Icons as any)[iconName];
                                    return (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => { setIcon(iconName); setShowIconPicker(false); }}
                                            className={`p-2 rounded-md flex flex-col items-center gap-1 hover:bg-secondary ${icon === iconName ? 'bg-secondary' : ''}`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="text-[10px] truncate w-full text-center">{iconName}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        className="px-6 py-2.5 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                        Create Team
                    </button>
                </div>
            </form>
        </Dialog>
    );
}

interface EditTeamDialogProps {
    isOpen: boolean;
    onClose: () => void;
    team: Team;
}

export function EditTeamDialog({ isOpen, onClose, team }: EditTeamDialogProps) {
    const { updateTeam, deleteTeam } = useAppStore();
    const [name, setName] = useState(team.name);
    const [color, setColor] = useState(team.color);
    const [icon, setIcon] = useState(team.icon);
    const [showIconPicker, setShowIconPicker] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateTeam(team.id, { name, color, icon });
        onClose();
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${team.name}"? This action cannot be undone.`)) {
            deleteTeam(team.id);
            onClose();
        }
    };

    const IconComponent = (Icons as any)[icon] || Icons.Music;

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Edit Team">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-medium block">Team Name</label>
                    <input
                        required
                        className="w-full p-3 rounded-lg border border-input bg-background"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium block">Color</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setColor(c.value)}
                                    className={`w-8 h-8 rounded-full ${c.value} transition-transform ${color === c.value ? 'scale-110 ring-2 ring-offset-2 ring-primary' : 'hover:scale-105'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2 relative">
                        <label className="text-sm font-medium block">Icon</label>
                        <button
                            type="button"
                            onClick={() => setShowIconPicker(!showIconPicker)}
                            className="w-full p-3 rounded-lg border border-input bg-background flex justify-between items-center"
                        >
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-md ${color} text-white`}>
                                    <IconComponent className="w-4 h-4" />
                                </div>
                                <span>{icon}</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {showIconPicker && (
                            <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg p-3 max-h-48 overflow-y-auto grid grid-cols-4 gap-2">
                                {ICONS.map((iconName) => {
                                    const Icon = (Icons as any)[iconName];
                                    return (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => { setIcon(iconName); setShowIconPicker(false); }}
                                            className={`p-2 rounded-md flex flex-col items-center gap-1 hover:bg-secondary ${icon === iconName ? 'bg-secondary' : ''}`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="text-[10px] truncate w-full text-center">{iconName}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
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
