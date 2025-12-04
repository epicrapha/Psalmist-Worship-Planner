import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Dialog } from '../ui/dialog';
import type { TeamMember } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

interface EditMemberDialogProps {
    isOpen: boolean;
    onClose: () => void;
    member: TeamMember;
}

export function EditMemberDialog({ isOpen, onClose, member }: EditMemberDialogProps) {
    const { updateTeamMember, deleteTeamMember, customRoles, addCustomRole } = useAppStore();
    const [name, setName] = useState(member.name);
    const [role, setRole] = useState(member.role);
    const [isAddingRole, setIsAddingRole] = useState(false);
    const [newRoleValue, setNewRoleValue] = useState('');
    const newRoleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isAddingRole && newRoleInputRef.current) {
            newRoleInputRef.current.focus();
        }
    }, [isAddingRole]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateTeamMember(member.id, { name, role });
        onClose();
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
            deleteTeamMember(member.id);
            onClose();
        }
    };

    const handleAddRole = () => {
        if (newRoleValue.trim()) {
            addCustomRole(newRoleValue.trim());
            setRole(newRoleValue.trim());
            setNewRoleValue('');
            setIsAddingRole(false);
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Edit Team Member">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center space-x-4 mb-4">
                    <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium block">Name</label>
                        <input
                            required
                            className="w-full p-3 rounded-lg border border-input bg-background text-lg font-semibold"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>

                {/* Role Picker */}
                <div className="space-y-2">
                    <label className="text-sm font-medium block">Role</label>
                    <div className="flex flex-wrap gap-2">
                        {customRoles.map(r => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setRole(r)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${role === r ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                            >
                                {r}
                            </button>
                        ))}
                        {isAddingRole ? (
                            <input
                                ref={newRoleInputRef}
                                type="text"
                                placeholder="Role name"
                                className="px-3 py-1.5 rounded-full text-sm font-medium bg-secondary border border-primary w-28"
                                value={newRoleValue}
                                onChange={(e) => setNewRoleValue(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRole(); } else if (e.key === 'Escape') { setIsAddingRole(false); setNewRoleValue(''); } }}
                                onBlur={() => { if (!newRoleValue.trim()) setIsAddingRole(false); }}
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsAddingRole(true)}
                                className="px-3 py-1.5 rounded-full text-sm font-medium bg-secondary hover:bg-secondary/80 flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
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
