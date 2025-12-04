import { Plus, Grid, List, Trash2, Pencil, Check, X, GripVertical, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { InviteMemberDialog } from '../components/teams/InviteMemberDialog';
import { EditMemberDialog } from '../components/teams/EditMemberDialog';
import { RoleEditorDialog } from '../components/teams/RoleEditorDialog';
import { AvailabilityCalendar } from '../components/teams/AvailabilityCalendar';
import { Card, CardContent } from '../components/ui/card';
import type { TeamMember, RoleDefinition } from '../types';
import { cn } from '../lib/utils';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as Icons from 'lucide-react';

function SortableRoleItem({ role, onEdit, isSelecting, isSelected, onToggleSelect }: {
    role: RoleDefinition;
    onEdit: (role: RoleDefinition) => void;
    isSelecting: boolean;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: role.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const IconComp = (Icons as any)[role.icon] || Icons.User;

    return (
        <div ref={setNodeRef} style={style} className={cn("flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-transparent hover:border-border transition-colors group", isSelected && "ring-2 ring-primary bg-primary/5")}>
            {!isSelecting && (
                <button {...attributes} {...listeners} className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4" />
                </button>
            )}
            {isSelecting && (
                <button onClick={() => onToggleSelect(role.id)} className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground")}>
                    {isSelected && <Check className="w-3 h-3" />}
                </button>
            )}
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white", role.color)}>
                <IconComp className="w-4 h-4" />
            </div>
            <span className="font-medium flex-1">{role.name}</span>
            <button onClick={() => onEdit(role)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Pencil className="w-4 h-4" />
            </button>
        </div>
    );
}

export function Teams() {
    const { team, customRoles, deleteTeamMember, reorderRoles, deleteCustomRole, plans } = useAppStore();
    const [showInvite, setShowInvite] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [showCalendar, setShowCalendar] = useState(true);

    // View states
    const [rosterView, setRosterView] = useState<'grid' | 'list'>('list');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);

    // Roles editing
    const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
    const [showRoleEditor, setShowRoleEditor] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [isSelectingRoles, setIsSelectingRoles] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = customRoles.findIndex((r) => r.id === active.id);
            const newIndex = customRoles.findIndex((r) => r.id === over.id);
            reorderRoles(arrayMove(customRoles, oldIndex, newIndex));
        }
    };

    const toggleMemberSelection = (id: string) => {
        setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
    };

    const toggleRoleSelection = (id: string) => {
        setSelectedRoles(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
    };

    const handleDeleteSelectedMembers = () => {
        if (confirm(`Delete ${selectedMembers.length} selected member(s)?`)) {
            selectedMembers.forEach(id => deleteTeamMember(id));
            setSelectedMembers([]);
            setIsSelecting(false);
        }
    };

    const handleDeleteSelectedRoles = () => {
        if (confirm(`Delete ${selectedRoles.length} selected role(s)?`)) {
            selectedRoles.forEach(id => deleteCustomRole(id));
            setSelectedRoles([]);
            setIsSelectingRoles(false);
        }
    };

    const getMemberRoles = (memberRoles: string[]) => {
        return memberRoles.map(roleName => customRoles.find(r => r.name === roleName)).filter(Boolean) as RoleDefinition[];
    };

    const getCommittedEvents = (memberId: string) => {
        return plans.filter(plan => plan.team?.some(tm => tm.memberId === memberId));
    };

    return (
        <div className="space-y-8 pb-24 animate-in fade-in duration-500 relative min-h-screen">
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
                    {team.map((member) => {
                        const memberRoles = getMemberRoles(member.roles || []);
                        const committedEvents = getCommittedEvents(member.id);

                        return (
                            <Card key={member.id} className={cn("overflow-hidden cursor-pointer transition-all hover:border-primary/50", isSelecting && selectedMembers.includes(member.id) && "ring-2 ring-primary")}>
                                <CardContent className={cn("flex items-center justify-between relative", rosterView === 'grid' ? "p-3 flex-col text-center" : "p-4")}>
                                    {isSelecting && (
                                        <button onClick={() => toggleMemberSelection(member.id)} className={cn("absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10", selectedMembers.includes(member.id) ? "bg-primary border-primary text-white" : "border-muted-foreground bg-background")}>
                                            {selectedMembers.includes(member.id) && <Check className="w-3 h-3" />}
                                        </button>
                                    )}
                                    <button onClick={() => isSelecting ? toggleMemberSelection(member.id) : setEditingMember(member)} className={cn("flex items-center flex-1 w-full", rosterView === 'grid' ? "flex-col" : "space-x-4")}>
                                        <img src={member.avatar} alt={member.name} className={cn("rounded-full object-cover border-2 border-background shadow-sm", rosterView === 'grid' ? "w-16 h-16 mb-2" : "w-12 h-12")} />
                                        <div className={cn("flex-1 min-w-0", rosterView === 'grid' ? "text-center w-full" : "text-left")}>
                                            <h3 className="font-semibold truncate">{member.name}</h3>
                                            <div className={cn("flex flex-wrap gap-1 mt-1", rosterView === 'grid' ? "justify-center" : "")}>
                                                {memberRoles.map(role => (
                                                    <span key={role.id} className={cn("text-[10px] px-1.5 py-0.5 rounded-full text-white flex items-center gap-1", role.color)}>
                                                        {role.name}
                                                    </span>
                                                ))}
                                                {memberRoles.length === 0 && <span className="text-xs text-muted-foreground">Member</span>}
                                            </div>
                                            {committedEvents.length > 0 && (
                                                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{committedEvents.length} Event{committedEvents.length > 1 ? 's' : ''}</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </CardContent>
                            </Card>
                        );
                    })}
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
                                {selectedRoles.length > 0 && (
                                    <button onClick={handleDeleteSelectedRoles} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button onClick={() => { setIsSelectingRoles(false); setSelectedRoles([]); }} className="p-2 hover:bg-secondary rounded-lg">
                                    <X className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setIsSelectingRoles(true)} className="text-xs text-primary hover:underline">Select</button>
                        )}
                    </div>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={customRoles.map(r => r.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                            {customRoles.map((role) => (
                                <SortableRoleItem
                                    key={role.id}
                                    role={role}
                                    onEdit={(r) => { setEditingRole(r); setShowRoleEditor(true); }}
                                    isSelecting={isSelectingRoles}
                                    isSelected={selectedRoles.includes(role.id)}
                                    onToggleSelect={toggleRoleSelection}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                <button
                    onClick={() => { setEditingRole(null); setShowRoleEditor(true); }}
                    className="w-full py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Create New Role
                </button>
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
            <RoleEditorDialog isOpen={showRoleEditor} onClose={() => setShowRoleEditor(false)} roleToEdit={editingRole || undefined} />
        </div>
    );
}
