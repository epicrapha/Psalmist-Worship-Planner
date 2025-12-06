import { useState, useEffect } from 'react';
import { Dialog } from '../ui/dialog';
import { useAppStore } from '../../store/useAppStore';
import type { RoleDefinition } from '../../types';
import { Check, ChevronDown } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';
import { ColorIconPicker } from '../ui/ColorIconPicker';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { PERMISSIONS } from '../../constants/permissions';

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

export function RoleEditorDialog({ isOpen, onClose, roleToEdit }: RoleEditorDialogProps) {
    const { addCustomRole, updateCustomRole, teams, currentTeamId } = useAppStore();
    const currentTeam = teams.find(t => t.id === currentTeamId);
    const customRoles = currentTeam?.roles || [];
    const roleGroups = currentTeam?.roleGroups || [];

    const [name, setName] = useState('');
    const [color, setColor] = useState(COLORS[0].value);
    const [icon, setIcon] = useState('User');
    const [permissions, setPermissions] = useState<string[]>([]);
    const [groupId, setGroupId] = useState<string | undefined>(undefined);
    const [isGroupDrawerOpen, setIsGroupDrawerOpen] = useState(false);

    useEffect(() => {
        if (roleToEdit) {
            setName(roleToEdit.name);
            setColor(roleToEdit.color);
            setIcon(roleToEdit.icon);
            setPermissions(roleToEdit.permissions || []);
            setGroupId(roleToEdit.groupId);
        } else {
            setName('');
            setColor(COLORS[Math.floor(Math.random() * COLORS.length)].value);
            setIcon('User');
            setPermissions([]);
            setGroupId(undefined);
        }
    }, [roleToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (roleToEdit) {
            updateCustomRole(roleToEdit.id, { name, color, icon, permissions, groupId });
        } else {
            const newRole: RoleDefinition = {
                id: Math.random().toString(36).substr(2, 9),
                name,
                color,
                icon,
                order: customRoles.length,
                permissions,
                groupId,
            };
            addCustomRole(newRole);
        }
        onClose();
    };

    const togglePermission = (permId: string) => {
        setPermissions(prev =>
            prev.includes(permId)
                ? prev.filter(p => p !== permId)
                : [...prev, permId]
        );
    };

    const selectedGroup = roleGroups.find(g => g.id === groupId);
    const GroupIcon = selectedGroup ? (Icons as any)[selectedGroup.icon] || Icons.Users : Icons.Users;

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={roleToEdit ? 'Edit Role' : 'Create New Role'}>
            <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
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
                    <label className="text-sm font-medium block">Role Group</label>
                    <button
                        type="button"
                        onClick={() => setIsGroupDrawerOpen(true)}
                        className="w-full p-3 rounded-lg border border-input bg-background flex items-center justify-between hover:bg-secondary/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-md text-white shadow-sm", selectedGroup ? selectedGroup.color : "bg-secondary text-muted-foreground")}>
                                <GroupIcon className="w-5 h-5" />
                            </div>
                            <span className={!selectedGroup ? "text-muted-foreground" : ""}>
                                {selectedGroup ? selectedGroup.name : "No Group (Ungrouped)"}
                            </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>

                    <Sheet open={isGroupDrawerOpen} onOpenChange={setIsGroupDrawerOpen}>
                        <SheetContent side="right">
                            <SheetHeader>
                                <SheetTitle>Select Role Group</SheetTitle>
                            </SheetHeader>
                            <div className="space-y-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => { setGroupId(undefined); setIsGroupDrawerOpen(false); }}
                                    className={cn(
                                        "w-full p-3 rounded-lg flex items-center gap-3 transition-colors",
                                        !groupId ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                                    )}
                                >
                                    <div className="p-2 rounded-md bg-secondary text-muted-foreground">
                                        <Icons.Users className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium">No Group (Ungrouped)</span>
                                    {!groupId && <Check className="w-4 h-4 ml-auto" />}
                                </button>

                                {roleGroups.map(group => {
                                    const GIcon = (Icons as any)[group.icon] || Icons.Users;
                                    return (
                                        <button
                                            key={group.id}
                                            type="button"
                                            onClick={() => { setGroupId(group.id); setIsGroupDrawerOpen(false); }}
                                            className={cn(
                                                "w-full p-3 rounded-lg flex items-center gap-3 transition-colors",
                                                groupId === group.id ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                                            )}
                                        >
                                            <div className={cn("p-2 rounded-md text-white", group.color)}>
                                                <GIcon className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium">{group.name}</span>
                                            {groupId === group.id && <Check className="w-4 h-4 ml-auto" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                <ColorIconPicker
                    color={color}
                    icon={icon}
                    onColorChange={setColor}
                    onIconChange={setIcon}
                />

                <div className="space-y-3">
                    <label className="text-sm font-medium block">Permissions</label>
                    <div className="space-y-2 bg-secondary/30 p-3 rounded-lg border border-border">
                        {PERMISSIONS.map((perm) => (
                            <div key={perm.id} className="flex items-start gap-3 p-2 hover:bg-secondary/50 rounded-md transition-colors">
                                <input
                                    type="checkbox"
                                    id={`perm-${perm.id}`}
                                    checked={permissions.includes(perm.id)}
                                    onChange={() => togglePermission(perm.id)}
                                    className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor={`perm-${perm.id}`} className="flex-1 cursor-pointer">
                                    <div className="font-medium text-sm">{perm.name}</div>
                                    <div className="text-xs text-muted-foreground">{perm.description}</div>
                                </label>
                            </div>
                        ))}
                    </div>
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
