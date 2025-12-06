import { useState, useEffect } from 'react';
import { Dialog } from '../ui/dialog';
import { useAppStore } from '../../store/useAppStore';
import type { RoleGroup } from '../../types';
import { ColorIconPicker } from '../ui/ColorIconPicker';

interface RoleGroupDialogProps {
    isOpen: boolean;
    onClose: () => void;
    groupToEdit?: RoleGroup;
}

const COLORS = [
    { name: 'Red', value: 'bg-red-500' },
    { name: 'Orange', value: 'bg-orange-500' },
    { name: 'Amber', value: 'bg-amber-500' },
    { name: 'Yellow', value: 'bg-yellow-500' },
    { name: 'Lime', value: 'bg-lime-500' },
    { name: 'Green', value: 'bg-green-500' },
    { name: 'Emerald', value: 'bg-emerald-500' },
    { name: 'Teal', value: 'bg-teal-500' },
    { name: 'Cyan', value: 'bg-cyan-500' },
    { name: 'Sky', value: 'bg-sky-500' },
    { name: 'Blue', value: 'bg-blue-500' },
    { name: 'Indigo', value: 'bg-indigo-500' },
    { name: 'Violet', value: 'bg-violet-500' },
    { name: 'Purple', value: 'bg-purple-500' },
    { name: 'Fuchsia', value: 'bg-fuchsia-500' },
    { name: 'Pink', value: 'bg-pink-500' },
    { name: 'Rose', value: 'bg-rose-500' },
    { name: 'Slate', value: 'bg-slate-500' },
];

export function RoleGroupDialog({ isOpen, onClose, groupToEdit }: RoleGroupDialogProps) {
    const { addRoleGroup, updateRoleGroup, teams, currentTeamId } = useAppStore();
    const currentTeam = teams.find(t => t.id === currentTeamId);
    const roleGroups = currentTeam?.roleGroups || [];

    const [name, setName] = useState('');
    const [color, setColor] = useState(COLORS[0].value);
    const [icon, setIcon] = useState('Users');

    useEffect(() => {
        if (groupToEdit) {
            setName(groupToEdit.name);
            setColor(groupToEdit.color);
            setIcon(groupToEdit.icon);
        } else {
            setName('');
            setColor(COLORS[Math.floor(Math.random() * COLORS.length)].value);
            setIcon('Users');
        }
    }, [groupToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (groupToEdit) {
            updateRoleGroup(groupToEdit.id, { name, color, icon });
        } else {
            const newGroup: RoleGroup = {
                id: Math.random().toString(36).substr(2, 9),
                name,
                color,
                icon,
                order: roleGroups.length,
            };
            addRoleGroup(newGroup);
        }
        onClose();
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={groupToEdit ? 'Edit Role Group' : 'Create Role Group'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium block">Group Name</label>
                    <input
                        required
                        placeholder="e.g. Leadership"
                        className="w-full p-3 rounded-lg border border-input bg-background"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <ColorIconPicker
                    color={color}
                    icon={icon}
                    onColorChange={setColor}
                    onIconChange={setIcon}
                />

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        className="px-6 py-2.5 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                        {groupToEdit ? 'Save Changes' : 'Create Group'}
                    </button>
                </div>
            </form>
        </Dialog>
    );
}
