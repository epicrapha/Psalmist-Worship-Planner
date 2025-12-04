import { useState, useEffect } from 'react';
import { Dialog } from '../ui/dialog';
import { useAppStore } from '../../store/useAppStore';
import type { RoleDefinition } from '../../types';
import { Check, ChevronDown } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';

interface RoleEditorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    roleToEdit?: RoleDefinition;
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

const AVAILABLE_ICONS = [
    'Mic', 'Mic2', 'Guitar', 'Drum', 'Piano', 'Music', 'Music2', 'Music3', 'Music4',
    'Speaker', 'Radio', 'Headphones', 'User', 'Users', 'Shield', 'Star', 'Heart',
    'Zap', 'Camera', 'Video', 'Monitor', 'Smartphone', 'Tablet', 'Laptop'
];

export function RoleEditorDialog({ isOpen, onClose, roleToEdit }: RoleEditorDialogProps) {
    const { addCustomRole, updateCustomRole, customRoles } = useAppStore();
    const [name, setName] = useState('');
    const [color, setColor] = useState(COLORS[0].value);
    const [icon, setIcon] = useState('User');
    const [showIconPicker, setShowIconPicker] = useState(false);

    useEffect(() => {
        if (roleToEdit) {
            setName(roleToEdit.name);
            setColor(roleToEdit.color);
            setIcon(roleToEdit.icon);
        } else {
            setName('');
            setColor(COLORS[Math.floor(Math.random() * COLORS.length)].value);
            setIcon('User');
        }
    }, [roleToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (roleToEdit) {
            updateCustomRole(roleToEdit.id, { name, color, icon });
        } else {
            const newRole: RoleDefinition = {
                id: Math.random().toString(36).substr(2, 9),
                name,
                color,
                icon,
                order: customRoles.length,
            };
            addCustomRole(newRole);
        }
        onClose();
    };

    const SelectedIcon = (Icons as any)[icon] || Icons.User;

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={roleToEdit ? 'Edit Role' : 'Create New Role'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium block">Role Name</label>
                    <input
                        required
                        placeholder="e.g. Worship Leader"
                        className="w-full p-3 rounded-lg border border-input bg-background"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium block">Color</label>
                    <div className="grid grid-cols-6 gap-2">
                        {COLORS.map((c) => (
                            <button
                                key={c.value}
                                type="button"
                                onClick={() => setColor(c.value)}
                                className={cn(
                                    "w-8 h-8 rounded-full transition-all flex items-center justify-center",
                                    c.value,
                                    color === c.value ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"
                                )}
                                title={c.name}
                            >
                                {color === c.value && <Check className="w-4 h-4 text-white" />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2 relative">
                    <label className="text-sm font-medium block">Icon</label>
                    <button
                        type="button"
                        onClick={() => setShowIconPicker(!showIconPicker)}
                        className="w-full p-3 rounded-lg border border-input bg-background flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <div className={cn("p-1.5 rounded-md text-white", color)}>
                                <SelectedIcon className="w-5 h-5" />
                            </div>
                            <span>{icon}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>

                    {showIconPicker && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg p-3 max-h-48 overflow-y-auto grid grid-cols-6 gap-2">
                            {AVAILABLE_ICONS.map((iconName) => {
                                const IconComp = (Icons as any)[iconName];
                                return (
                                    <button
                                        key={iconName}
                                        type="button"
                                        onClick={() => { setIcon(iconName); setShowIconPicker(false); }}
                                        className={cn(
                                            "p-2 rounded-lg flex items-center justify-center transition-colors",
                                            icon === iconName ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                                        )}
                                        title={iconName}
                                    >
                                        {IconComp && <IconComp className="w-5 h-5" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        className="px-6 py-2.5 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                        {roleToEdit ? 'Save Changes' : 'Create Role'}
                    </button>
                </div>
            </form>
        </Dialog>
    );
}
