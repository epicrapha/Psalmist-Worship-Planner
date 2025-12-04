import { Plus, Grid, List, Trash2, Pencil, Check, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { InviteMemberDialog } from '../components/teams/InviteMemberDialog';
import { EditMemberDialog } from '../components/teams/EditMemberDialog';
import { AvailabilityCalendar } from '../components/teams/AvailabilityCalendar';
import { Card, CardContent } from '../components/ui/card';
import type { TeamMember } from '../types';
import { cn } from '../lib/utils';

export function Teams() {
    const { team, customRoles, addCustomRole, updateCustomRole, deleteTeamMember } = useAppStore();
    const [showInvite, setShowInvite] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [showCalendar, setShowCalendar] = useState(true);

    // View states
    const [rosterView, setRosterView] = useState<'grid' | 'list'>('list');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);

    // Roles editing
    const [editingRole, setEditingRole] = useState<string | null>(null);
    const [editRoleValue, setEditRoleValue] = useState('');
    const [isAddingRole, setIsAddingRole] = useState(false);
    const [newRoleValue, setNewRoleValue] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [isSelectingRoles, setIsSelectingRoles] = useState(false);

    const newRoleInputRef = useRef<HTMLInputElement>(null);
    const editRoleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isAddingRole && newRoleInputRef.current) newRoleInputRef.current.focus();
    }, [isAddingRole]);

    useEffect(() => {
        if (editingRole && editRoleInputRef.current) editRoleInputRef.current.focus();
    }, [editingRole]);

    const toggleMemberSelection = (id: string) => {
        setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
    };

    const toggleRoleSelection = (role: string) => {
        setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
    };

    const handleDeleteSelectedMembers = () => {
        if (confirm(`Delete ${selectedMembers.length} selected member(s)?`)) {
            selectedMembers.forEach(id => deleteTeamMember(id));
            setSelectedMembers([]);
            setIsSelecting(false);
        }
    };

    const handleAddRole = () => {
        if (newRoleValue.trim()) {
            addCustomRole(newRoleValue.trim());
            setNewRoleValue('');
            setIsAddingRole(false);
        }
    };

    const handleEditRole = (oldRole: string) => {
        if (editRoleValue.trim() && editRoleValue !== oldRole) {
            updateCustomRole(oldRole, editRoleValue.trim());
        }
        setEditingRole(null);
        setEditRoleValue('');
    };

    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-500 relative min-h-screen">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Team</h1>
                <div className="text-sm text-muted-foreground">
                    {team.length} Members
                </div>
            </div>

            {/* Roster Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold tracking-tight">Roster</h2>
                    <div className="flex items-center gap-2">
                        {isSelecting ? (
                            <>
                                <span className="text-xs text-muted-foreground">{selectedMembers.length} selected</span>
                                {selectedMembers.length > 0 && (
                                    <button onClick={handleDeleteSelectedMembers} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button onClick={() => { setIsSelecting(false); setSelectedMembers([]); }} className="p-2 hover:bg-secondary rounded-lg">
                                    <X className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsSelecting(true)} className="text-xs text-primary hover:underline">Select</button>
                                <div className="flex bg-secondary rounded-lg p-0.5">
                                    <button onClick={() => setRosterView('list')} className={cn("p-1.5 rounded-md transition-colors", rosterView === 'list' ? "bg-background shadow-sm" : "text-muted-foreground")}>
                                        <List className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setRosterView('grid')} className={cn("p-1.5 rounded-md transition-colors", rosterView === 'grid' ? "bg-background shadow-sm" : "text-muted-foreground")}>
                                        <Grid className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className={cn(rosterView === 'grid' ? "grid grid-cols-2 gap-3" : "space-y-3")}>
                    {team.map((member) => (
                        <Card key={member.id} className={cn("overflow-hidden cursor-pointer transition-all", isSelecting && selectedMembers.includes(member.id) && "ring-2 ring-primary")}>
                            <CardContent className={cn("flex items-center justify-between", rosterView === 'grid' ? "p-3 flex-col text-center" : "p-4")}>
                                {isSelecting && (
                                    <button onClick={() => toggleMemberSelection(member.id)} className={cn("absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center", selectedMembers.includes(member.id) ? "bg-primary border-primary text-white" : "border-muted-foreground")}>
                                        {selectedMembers.includes(member.id) && <Check className="w-3 h-3" />}
                                    </button>
                                )}
                                <button onClick={() => isSelecting ? toggleMemberSelection(member.id) : setEditingMember(member)} className={cn("flex items-center flex-1", rosterView === 'grid' ? "flex-col" : "space-x-4")}>
                                    <img src={member.avatar} alt={member.name} className={cn("rounded-full object-cover border-2 border-background shadow-sm", rosterView === 'grid' ? "w-16 h-16 mb-2" : "w-12 h-12")} />
                                    <div className={rosterView === 'grid' ? "text-center" : ""}>
                                        <h3 className="font-semibold">{member.name}</h3>
                                        <p className="text-xs text-muted-foreground">{member.role}</p>
                                    </div>
                                </button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Roles Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold tracking-tight">Roles</h2>
                    <div className="flex items-center gap-2">
                        {isSelectingRoles ? (
                            <>
                                <span className="text-xs text-muted-foreground">{selectedRoles.length} selected</span>
                                <button onClick={() => { setIsSelectingRoles(false); setSelectedRoles([]); }} className="p-2 hover:bg-secondary rounded-lg">
                                    <X className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setIsSelectingRoles(true)} className="text-xs text-primary hover:underline">Select</button>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {customRoles.map(role => (
                        editingRole === role ? (
                            <input
                                key={role}
                                ref={editRoleInputRef}
                                type="text"
                                className="px-3 py-1.5 rounded-full text-sm font-medium bg-secondary border border-primary w-28"
                                value={editRoleValue}
                                onChange={(e) => setEditRoleValue(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleEditRole(role); } else if (e.key === 'Escape') setEditingRole(null); }}
                                onBlur={() => handleEditRole(role)}
                            />
                        ) : (
                            <button
                                key={role}
                                onClick={() => isSelectingRoles ? toggleRoleSelection(role) : null}
                                onDoubleClick={() => { setEditingRole(role); setEditRoleValue(role); }}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-sm font-medium transition-colors relative group",
                                    isSelectingRoles && selectedRoles.includes(role) ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
                                )}
                            >
                                {role}
                                {!isSelectingRoles && (
                                    <button onClick={(e) => { e.stopPropagation(); setEditingRole(role); setEditRoleValue(role); }} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Pencil className="w-3 h-3" />
                                    </button>
                                )}
                            </button>
                        )
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
                        <button onClick={() => setIsAddingRole(true)} className="px-3 py-1.5 rounded-full text-sm font-medium bg-secondary hover:bg-secondary/80 flex items-center gap-1">
                            <Plus className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Availability Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold tracking-tight">Availability</h2>
                    <button onClick={() => setShowCalendar(!showCalendar)} className="text-sm text-primary hover:underline">
                        {showCalendar ? 'Hide Calendar' : 'View Calendar'}
                    </button>
                </div>
                {showCalendar && <AvailabilityCalendar team={team} />}
            </div>

            {/* FAB */}
            <button onClick={() => setShowInvite(true)} className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors active:scale-95 z-40">
                <Plus className="w-7 h-7" />
            </button>

            <InviteMemberDialog isOpen={showInvite} onClose={() => setShowInvite(false)} />
            {editingMember && <EditMemberDialog isOpen={!!editingMember} onClose={() => setEditingMember(null)} member={editingMember} />}
        </div>
    );
}
