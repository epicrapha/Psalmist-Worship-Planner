import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Dialog } from '../ui/dialog';
import type { TeamMember } from '../../types';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InviteMemberDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InviteMemberDialog({ isOpen, onClose }: InviteMemberDialogProps) {
    const { addTeamMember, customRoles } = useAppStore();
    const [name, setName] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newMember: TeamMember = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            roles: selectedRoles.length > 0 ? selectedRoles : ['Member'],
            avatar: `https://i.pravatar.cc/150?u=${Math.random()}`,
            availability: {},
        };
        addTeamMember(newMember);
        onClose();
        setName('');
        setSelectedRoles([]);
    };

    const toggleRole = (roleName: string) => {
        setSelectedRoles(prev =>
            prev.includes(roleName)
                ? prev.filter(r => r !== roleName)
                : [...prev, roleName]
        );
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Invite Team Member">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-medium block">Name</label>
                    <input
                        required
                        placeholder="Member name"
                        className="w-full p-3 rounded-lg border border-input bg-background"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* Role Picker */}
                <div className="space-y-2">
                    <label className="text-sm font-medium block">Roles</label>
                    <div className="flex flex-wrap gap-2">
                        {customRoles.map(r => (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => toggleRole(r.name)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1",
                                    selectedRoles.includes(r.name)
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary hover:bg-secondary/80"
                                )}
                            >
                                {selectedRoles.includes(r.name) && <Check className="w-3 h-3" />}
                                {r.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        className="px-6 py-2.5 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                        Invite Member
                    </button>
                </div>
            </form>
        </Dialog>
    );
}
