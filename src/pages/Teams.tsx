import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { usePermissions } from '../hooks/use-permissions';
import type { TeamMember, RoleDefinition, RoleGroup } from '../types';
import {
    Plus,
    Trash2,
    Edit2,
    Settings,
    ArrowLeft,
    ChevronRight,
    ChevronDown,
    Check,
    FolderPlus
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { InviteMemberDialog } from '../components/teams/InviteMemberDialog';
import { EditMemberDialog } from '../components/teams/EditMemberDialog';
import { RoleEditorDialog } from '../components/teams/RoleEditorDialog';
import { RoleGroupDialog } from '../components/teams/RoleGroupDialog';
import { CreateTeamDialog, EditTeamDialog } from '../components/teams/TeamDialogs';
import { MemberProfileDialog } from '../components/teams/MemberProfileDialog';
import { AvailabilityCalendar } from '../components/teams/AvailabilityCalendar';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableRoleItem({ role, onEdit }: { role: RoleDefinition; onEdit: (role: RoleDefinition) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: role.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const Icon = (Icons as any)[role.icon] || Icons.User;

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center justify-between p-3 bg-secondary/30 border border-border/50 rounded-lg group hover:bg-secondary transition-colors cursor-move">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${role.color} bg-opacity-90 text-white shadow-sm`}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm">{role.name}</span>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onEdit(role); }}
                className="p-1.5 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity bg-background rounded-md shadow-sm"
            >
                <Edit2 className="w-3 h-3" />
            </button>
        </div>
    );
}

// Droppable Group Component
const DroppableGroup = ({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) => {
    const { setNodeRef } = useDroppable({ id });
    return <div ref={setNodeRef} className={className}>{children}</div>;
};

export function Teams() {
    const { teams, currentTeamId, setCurrentTeam, deleteTeamMember, reorderRoles } = useAppStore();
    const { can } = usePermissions();
    const currentTeam = teams.find(t => t.id === currentTeamId);

    // Derived state for current team
    const team = currentTeam?.members || [];
    const customRoles = currentTeam?.roles || [];
    const roleGroups = currentTeam?.roleGroups || [];
    const plans = currentTeam?.plans || [];

    // UI State
    const [showInvite, setShowInvite] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [viewingMember, setViewingMember] = useState<TeamMember | null>(null);

    // Selection Mode
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
    const [isCreatingRole, setIsCreatingRole] = useState(false);

    // Role Group State
    const [editingGroup, setEditingGroup] = useState<RoleGroup | null>(null);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

    // Team Management State
    const [showCreateTeam, setShowCreateTeam] = useState(false);
    const [editingTeam, setEditingTeam] = useState<typeof currentTeam | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeRole = customRoles.find(r => r.id === active.id);
        const overRole = customRoles.find(r => r.id === over.id);

        if (!activeRole) return;

        // Case 1: Dropped over another role
        if (overRole) {
            if (active.id !== over.id) {
                const oldIndex = customRoles.findIndex((r) => r.id === active.id);
                const newIndex = customRoles.findIndex((r) => r.id === over.id);

                const newRoles = [...customRoles];
                // Update group if different
                if (activeRole.groupId !== overRole.groupId) {
                    newRoles[oldIndex] = { ...newRoles[oldIndex], groupId: overRole.groupId };
                }

                reorderRoles(arrayMove(newRoles, oldIndex, newIndex));
            }
        }
        // Case 2: Dropped over a group container
        else {
            const isUngrouped = over.id === 'ungrouped-roles';
            const overGroup = roleGroups.find(g => g.id === over.id);

            if (overGroup || isUngrouped) {
                const newGroupId = isUngrouped ? undefined : overGroup?.id;
                if (activeRole.groupId !== newGroupId) {
                    const newRoles = customRoles.map(r =>
                        r.id === active.id ? { ...r, groupId: newGroupId } : r
                    );
                    reorderRoles(newRoles);
                }
            }
        }
    };

    const getMemberRoles = (memberRoles: string[]) => {
        return memberRoles.map(roleName => customRoles.find(r => r.name === roleName)).filter(Boolean) as RoleDefinition[];
    };

    const getMemberEvents = (memberId: string) => {
        return plans.filter(plan => plan.team?.some(tm => tm.memberId === memberId));
    };

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev =>
            prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        );
    };

    const toggleMemberSelection = (memberId: string) => {
        if (selectedMembers.includes(memberId)) {
            setSelectedMembers(selectedMembers.filter(id => id !== memberId));
        } else {
            setSelectedMembers([...selectedMembers, memberId]);
        }
    };

    // If no team is selected, show "All Teams" view
    if (!currentTeamId || !currentTeam) {
        return (
            <div className="space-y-6 pb-20 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">All Teams</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                        <div
                            key={team.id}
                            onClick={() => setCurrentTeam(team.id)}
                            className="group relative bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-lg ${team.color} text-white`}>
                                    {(Icons as any)[team.icon] && React.createElement((Icons as any)[team.icon], { className: "w-6 h-6" })}
                                </div>

                                {/* Avatar Pile */}
                                <div className="flex -space-x-2">
                                    {team.members.slice(0, 4).map(m => (
                                        <div key={m.id} className="w-8 h-8 rounded-full border-2 border-card bg-secondary overflow-hidden">
                                            <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    {team.members.length > 4 && (
                                        <div className="w-8 h-8 rounded-full border-2 border-card bg-secondary flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                                            +{team.members.length - 4}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{team.name}</h3>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{team.members.length} Members</div>
                                </div>
                                <div className="text-sm font-medium bg-secondary/50 px-2 py-1 rounded">
                                    {team.plans.length} Events
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAB */}
                <button
                    onClick={() => setShowCreateTeam(true)}
                    className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors active:scale-95 z-40"
                    title="Create Team"
                >
                    <Plus className="w-7 h-7" />
                </button>

                <CreateTeamDialog isOpen={showCreateTeam} onClose={() => setShowCreateTeam(false)} />
            </div>
        );
    }

    const groupedRoles = roleGroups.map(group => ({
        group,
        roles: customRoles.filter(r => r.groupId === group.id).sort((a, b) => a.order - b.order)
    }));
    const ungroupedRoles = customRoles.filter(r => !r.groupId).sort((a, b) => a.order - b.order);

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => setCurrentTeam('')} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${currentTeam.color} text-white`}>
                            {(Icons as any)[currentTeam.icon] && React.createElement((Icons as any)[currentTeam.icon], { className: "w-5 h-5" })}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight leading-none">{currentTeam.name}</h1>
                            <p className="text-sm text-muted-foreground mt-1">{team.length} members</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {can('manage_team') && (
                        <button
                            onClick={() => setEditingTeam(currentTeam)}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Roster Section (Left Column) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold">Roster</h2>
                            <div className="w-px h-4 bg-border mx-2" />
                            {can('manage_team') && (
                                <button
                                    onClick={() => setIsEditMode(!isEditMode)}
                                    className={`text-xs font-medium px-2 py-1 rounded transition-colors ${isEditMode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}
                                >
                                    {isEditMode ? 'Done' : 'Manage'}
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {isEditMode && selectedMembers.length > 0 && (
                                <button
                                    onClick={() => {
                                        if (confirm(`Delete ${selectedMembers.length} members?`)) {
                                            selectedMembers.forEach(id => deleteTeamMember(id));
                                            setSelectedMembers([]);
                                        }
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-sm font-medium"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete ({selectedMembers.length})
                                </button>
                            )}
                            {can('manage_team') && (
                                <button
                                    onClick={() => setShowInvite(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors text-sm font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Member
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        {team.map((member) => {
                            const memberRoles = getMemberRoles(member.roles || []);
                            const events = getMemberEvents(member.id);
                            const isSelected = selectedMembers.includes(member.id);

                            return (
                                <div
                                    key={member.id}
                                    onClick={() => {
                                        if (isEditMode) toggleMemberSelection(member.id);
                                        else setViewingMember(member);
                                    }}
                                    className={`
                                        group flex items-center justify-between p-3 rounded-lg border bg-card hover:border-primary/50 transition-all cursor-pointer
                                        ${isSelected && isEditMode ? 'border-primary bg-primary/5' : 'border-border'}
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Selection Checkbox (Visible only in Edit Mode) */}
                                        {isEditMode && (
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground bg-background'}`}>
                                                {isSelected && <Check className="w-3 h-3" />}
                                            </div>
                                        )}

                                        <div className="relative flex-shrink-0">
                                            <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{member.name}</h3>
                                            <div className="flex flex-wrap gap-1 mt-0.5">
                                                {memberRoles.slice(0, 3).map((role, i) => (
                                                    <span key={i} className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{role.name}</span>
                                                ))}
                                                {memberRoles.length > 3 && (
                                                    <span className="text-xs text-muted-foreground">+ {memberRoles.length - 3}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-sm text-muted-foreground hidden sm:block">
                                            {events.length} events
                                        </div>
                                        {!isEditMode && (
                                            <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Calendar & Roles */}
                <div className="space-y-8">
                    {/* Availability Calendar */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Availability</h2>
                        <AvailabilityCalendar team={team} />
                    </div>

                    {/* Roles Overview */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Roles</h2>
                            <div className="flex items-center gap-2">
                                {can('manage_team') && (
                                    <>
                                        <button
                                            onClick={() => setShowCreateGroup(true)}
                                            className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-primary"
                                            title="Create Group"
                                        >
                                            <FolderPlus className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setIsCreatingRole(true)}
                                            className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-primary"
                                            title="Create Role"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-4 space-y-4 max-h-[600px] overflow-y-auto">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                {/* Role Groups */}
                                {groupedRoles.map(({ group, roles }) => {
                                    const Icon = (Icons as any)[group.icon] || Icons.Users;
                                    const isExpanded = expandedGroups.includes(group.id);

                                    return (
                                        <DroppableGroup key={group.id} id={group.id} className="space-y-2">
                                            <div className="flex items-center justify-between group/header p-2 bg-secondary/20 rounded-lg hover:bg-secondary/40 transition-colors cursor-pointer" onClick={() => toggleGroup(group.id)}>
                                                <div className="flex items-center gap-2 text-sm font-semibold">
                                                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                                    <div className={`p-1 rounded ${group.color} text-white`}>
                                                        <Icon className="w-3 h-3" />
                                                    </div>
                                                    <span>{group.name}</span>
                                                </div>
                                                <div className="flex items-center opacity-0 group-hover/header:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setEditingGroup(group); }}
                                                        className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="pl-4 space-y-2 border-l-2 border-border ml-2 min-h-[10px]">
                                                    <SortableContext items={roles.map(r => r.id)} strategy={verticalListSortingStrategy}>
                                                        {roles.map((role) => (
                                                            <SortableRoleItem key={role.id} role={role} onEdit={setEditingRole} />
                                                        ))}
                                                    </SortableContext>
                                                </div>
                                            )}
                                        </DroppableGroup>
                                    );
                                })}

                                {/* Ungrouped Roles */}
                                <DroppableGroup id="ungrouped-roles" className="space-y-2">
                                    {groupedRoles.length > 0 && <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2 px-2">Ungrouped</div>}
                                    <SortableContext items={ungroupedRoles.map(r => r.id)} strategy={verticalListSortingStrategy}>
                                        {ungroupedRoles.map((role) => (
                                            <SortableRoleItem key={role.id} role={role} onEdit={setEditingRole} />
                                        ))}
                                    </SortableContext>
                                </DroppableGroup>
                            </DndContext>
                        </div>
                    </div>
                </div>
            </div>

            <InviteMemberDialog isOpen={showInvite} onClose={() => setShowInvite(false)} />

            {/* View Profile Dialog */}
            {viewingMember && (
                <MemberProfileDialog
                    isOpen={!!viewingMember}
                    onClose={() => setViewingMember(null)}
                    member={viewingMember}
                    onEdit={() => {
                        setEditingMember(viewingMember);
                        setViewingMember(null);
                    }}
                />
            )}

            {/* Edit Member Dialog */}
            {editingMember && (
                <EditMemberDialog
                    isOpen={!!editingMember}
                    onClose={() => setEditingMember(null)}
                    member={editingMember}
                />
            )}

            {(editingRole || isCreatingRole) && (
                <RoleEditorDialog
                    isOpen={!!editingRole || isCreatingRole}
                    onClose={() => { setEditingRole(null); setIsCreatingRole(false); }}
                    roleToEdit={editingRole || undefined}
                />
            )}
            <CreateTeamDialog isOpen={showCreateTeam} onClose={() => setShowCreateTeam(false)} />
            {editingTeam && (
                <EditTeamDialog
                    isOpen={!!editingTeam}
                    onClose={() => setEditingTeam(null)}
                    team={editingTeam}
                />
            )}
            <RoleGroupDialog
                isOpen={showCreateGroup}
                onClose={() => setShowCreateGroup(false)}
            />
            {editingGroup && (
                <RoleGroupDialog
                    isOpen={!!editingGroup}
                    onClose={() => setEditingGroup(null)}
                    groupToEdit={editingGroup}
                />
            )}
        </div>
    );
}
