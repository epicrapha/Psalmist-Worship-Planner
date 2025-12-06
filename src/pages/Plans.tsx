import { Download, Share, Plus, Calendar, MoreHorizontal, Pencil, ArrowLeft, Users, Trash2, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PlanTimeline } from '../components/plans/PlanTimeline';
import { useAppStore } from '../store/useAppStore';
import { usePermissions } from '../hooks/use-permissions';
import { format } from 'date-fns';
import { Card, CardContent } from '../components/ui/card';
import { AddEventDialog } from '../components/events/AddEventDialog';
import { EditEventDialog } from '../components/events/EditEventDialog';
import { EventsCalendar } from '../components/plans/EventsCalendar';
import type { ServicePlan } from '../types';
import { cn } from '../lib/utils';
import * as Icons from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '../components/ui/drawer';
import { useMediaQuery } from '../hooks/use-media-query';

// Persist view state
let lastViewedEventId: string | null = null;

export function Plans() {
    const navigate = useNavigate();
    const { teams, currentTeamId, updatePlan, addPlan, deletePlan } = useAppStore();
    const { can } = usePermissions();
    const currentTeam = teams.find(t => t.id === currentTeamId);
    const plans = currentTeamId ? (currentTeam?.plans || []) : teams.flatMap(t => t.plans);
    const team = currentTeam?.members || [];
    const customRoles = currentTeam?.roles || [];
    const roleGroups = currentTeam?.roleGroups || [];
    const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [prefillDate, setPrefillDate] = useState<string | undefined>(undefined);
    const [editingEvent, setEditingEvent] = useState<ServicePlan | null>(null);
    const [activeTab, setActiveTab] = useState<'timeline' | 'team'>('timeline');
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [filterStatus, setFilterStatus] = useState<'active' | 'archived'>('active');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Team assignment state
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignMode, setAssignMode] = useState<'individual' | 'group'>('individual');
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [showUnavailable, setShowUnavailable] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    // Click outside to close menus
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // ... (rest of effects)



    // ...


    // Restore last viewed event on mount
    useEffect(() => {
        if (lastViewedEventId) {
            const lastEvent = plans.find(p => p.id === lastViewedEventId);
            if (lastEvent) {
                setSelectedPlan(lastEvent);
            }
        }
    }, [plans]);

    // Save current view state
    useEffect(() => {
        lastViewedEventId = selectedPlan?.id || null;
    }, [selectedPlan]);

    const filteredPlans = plans
        .filter(p => filterStatus === 'active' ? !p.isArchived : p.isArchived)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const handleReorder = (newItems: any[]) => {
        if (selectedPlan) {
            updatePlan(selectedPlan.id, { items: newItems });
        }
    };

    const handleSelectEvent = (plan: ServicePlan) => {
        setSelectedPlan(plan);
    };

    const handleBackToAll = () => {
        setSelectedPlan(null);
    };

    const handleAssignMember = () => {
        if (selectedPlan && selectedMemberId && selectedRoleId) {
            const newTeam = [
                ...(selectedPlan.team || []),
                { memberId: selectedMemberId, role: selectedRoleId }
            ];
            updatePlan(selectedPlan.id, { team: newTeam });
            setIsAssigning(false);
            setSelectedMemberId('');
            setSelectedRoleId('');
        }
    };

    const handleAssignGroup = () => {
        if (selectedPlan && selectedGroupId) {
            const groupRoles = customRoles.filter(r => r.groupId === selectedGroupId);
            const groupRoleIds = groupRoles.map(r => r.id);

            // Find members who have any of these roles
            const membersToAdd: { memberId: string, role: string }[] = [];

            team.forEach(member => {
                // Find first matching role
                const matchingRole = member.roles?.find(rId => groupRoleIds.includes(rId));
                if (matchingRole) {
                    // Check if not already assigned with this role
                    const isAlreadyAssigned = selectedPlan.team?.some(
                        t => t.memberId === member.id && t.role === matchingRole
                    );

                    if (!isAlreadyAssigned) {
                        membersToAdd.push({ memberId: member.id, role: matchingRole });
                    }
                }
            });

            if (membersToAdd.length > 0) {
                const newTeam = [
                    ...(selectedPlan.team || []),
                    ...membersToAdd
                ];
                updatePlan(selectedPlan.id, { team: newTeam });
                alert(`Assigned ${membersToAdd.length} members from group.`);
            } else {
                alert('No new members found to assign from this group.');
            }

            setIsAssigning(false);
            setSelectedGroupId('');
        }
    };

    const handleRemoveMember = (memberId: string, roleId: string) => {
        if (selectedPlan) {
            const newTeam = (selectedPlan.team || []).filter(
                t => !(t.memberId === memberId && t.role === roleId)
            );
            updatePlan(selectedPlan.id, { team: newTeam });
        }
    };

    const handleDuplicate = (plan: ServicePlan) => {
        const newPlan: ServicePlan = {
            ...plan,
            id: Math.random().toString(36).substr(2, 9),
            title: `${plan.title} (Copy)`,
            isArchived: false
        };
        addPlan(newPlan);
    };

    const handleArchive = (plan: ServicePlan) => {
        updatePlan(plan.id, { isArchived: !plan.isArchived });
    };

    const handleDelete = (planId: string) => {
        if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            deletePlan(planId);
        }
    };

    const getRoleById = (id: string) => customRoles.find(r => r.id === id) || customRoles.find(r => r.name === id); // Fallback for old string roles
    const getMemberById = (id: string) => team.find(m => m.id === id);

    // Event detail view
    if (selectedPlan) {
        return (
            <div className="space-y-6 pb-20 animate-in fade-in duration-500">
                <div className="flex justify-between items-start">
                    <div>
                        <button
                            onClick={handleBackToAll}
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            All Events
                        </button>
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", selectedPlan.color ? selectedPlan.color.replace('bg-', 'bg-opacity-10 bg-') + ' text-' + selectedPlan.color.replace('bg-', '') : 'bg-primary/10 text-primary')}>
                                {selectedPlan.icon && (Icons as any)[selectedPlan.icon] ? (
                                    (() => {
                                        const Icon = (Icons as any)[selectedPlan.icon];
                                        return <Icon className="w-6 h-6" />;
                                    })()
                                ) : (
                                    <Calendar className="w-6 h-6" />
                                )}
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">{selectedPlan.title}</h1>
                            {can('manage_events') && (
                                <button
                                    onClick={() => setEditingEvent(selectedPlan)}
                                    className="p-1.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <p className="text-muted-foreground">{format(new Date(selectedPlan.date), 'EEEE, MMMM do, yyyy • h:mm a')}</p>
                        <button
                            onClick={() => navigate(`/live/${selectedPlan.id}`)}
                            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-full text-xs font-medium transition-colors mt-2"
                        >
                            <Monitor className="w-3 h-3" />
                            Tech View
                        </button>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: selectedPlan.title,
                                        text: `Check out the plan for ${selectedPlan.title}`,
                                        url: window.location.href,
                                    }).catch(console.error);
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link copied to clipboard!');
                                }
                            }}
                            className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <Share className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => {
                                const element = document.createElement("a");
                                const file = new Blob([JSON.stringify(selectedPlan, null, 2)], { type: 'text/plain' });
                                element.href = URL.createObjectURL(file);
                                element.download = `${selectedPlan.title.replace(/\s+/g, '_')}.json`;
                                document.body.appendChild(element);
                                element.click();
                                alert('Plan exported as JSON (Mock PDF)');
                            }}
                            className="p-2 rounded-full hover:bg-secondary transition-colors text-primary"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-secondary rounded-lg p-1 w-fit">
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={cn(
                            "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                            activeTab === 'timeline'
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Calendar className="w-4 h-4" />
                        Timeline
                    </button>
                    <button
                        onClick={() => setActiveTab('team')}
                        className={cn(
                            "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                            activeTab === 'team'
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Users className="w-4 h-4" />
                        Team ({selectedPlan.team?.length || 0})
                    </button>
                </div>

                {activeTab === 'timeline' && (
                    <div className="bg-secondary/30 rounded-xl p-4 border border-border/50 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex justify-between text-sm text-muted-foreground mb-4 px-2">
                            <span>{selectedPlan.items.length} Items</span>
                            <span>Total: {Math.floor(selectedPlan.items.reduce((acc, i) => acc + i.duration, 0) / 60)} mins</span>
                        </div>

                        <PlanTimeline
                            items={selectedPlan.items}
                            onReorder={handleReorder}
                            onUpdateItems={(items) => updatePlan(selectedPlan.id, { items })}
                        />
                    </div>
                )}

                {activeTab === 'team' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold">Assigned Team</h3>
                                {can('manage_events') && (
                                    <button
                                        onClick={() => setIsAssigning(!isAssigning)}
                                        className="text-sm text-primary hover:underline flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Assign Member
                                    </button>
                                )}
                            </div>

                            {isAssigning && (
                                <div className="bg-background p-4 rounded-lg border border-border mb-4 space-y-3">
                                    <div className="flex gap-2 border-b border-border pb-2 mb-2">
                                        <button
                                            onClick={() => setAssignMode('individual')}
                                            className={`text-xs font-medium px-2 py-1 rounded ${assignMode === 'individual' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            Assign Individual
                                        </button>
                                        <button
                                            onClick={() => setAssignMode('group')}
                                            className={`text-xs font-medium px-2 py-1 rounded ${assignMode === 'group' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            Assign Group
                                        </button>
                                    </div>

                                    {assignMode === 'individual' ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="text-xs font-medium text-muted-foreground">Member</label>
                                                    <button
                                                        onClick={() => setShowUnavailable(!showUnavailable)}
                                                        className="text-[10px] text-primary hover:underline"
                                                    >
                                                        {showUnavailable ? 'Hide Unavailable' : 'Show All'}
                                                    </button>
                                                </div>
                                                <select
                                                    className="w-full p-2 rounded-md bg-secondary border-transparent text-sm"
                                                    value={selectedMemberId}
                                                    onChange={(e) => setSelectedMemberId(e.target.value)}
                                                >
                                                    <option value="">Select Member</option>
                                                    {team
                                                        .filter(m => {
                                                            if (showUnavailable) return true;
                                                            // Simple check: if availability exists for date and is 'unavailable', hide
                                                            const status = m.availability?.[selectedPlan.date.split('T')[0]];
                                                            return status !== 'unavailable';
                                                        })
                                                        .map(m => {
                                                            const status = m.availability?.[selectedPlan.date.split('T')[0]];
                                                            const statusIcon = status === 'available' ? '✅' : status === 'unavailable' ? '❌' : '';
                                                            return (
                                                                <option key={m.id} value={m.id}>
                                                                    {statusIcon} {m.name}
                                                                </option>
                                                            );
                                                        })}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
                                                <select
                                                    className="w-full p-2 rounded-md bg-secondary border-transparent text-sm"
                                                    value={selectedRoleId}
                                                    onChange={(e) => setSelectedRoleId(e.target.value)}
                                                >
                                                    <option value="">Select Role</option>
                                                    {customRoles.map(r => (
                                                        <option key={r.id} value={r.id}>{r.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Role Group</label>
                                            <select
                                                className="w-full p-2 rounded-md bg-secondary border-transparent text-sm"
                                                value={selectedGroupId}
                                                onChange={(e) => setSelectedGroupId(e.target.value)}
                                            >
                                                <option value="">Select Group to Assign</option>
                                                {roleGroups.map(g => (
                                                    <option key={g.id} value={g.id}>{g.name}</option>
                                                ))}
                                            </select>
                                            <p className="text-[10px] text-muted-foreground mt-2">
                                                Assigns all members with roles in this group.
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setIsAssigning(false)} className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                                        <button
                                            onClick={assignMode === 'individual' ? handleAssignMember : handleAssignGroup}
                                            disabled={assignMode === 'individual' ? (!selectedMemberId || !selectedRoleId) : !selectedGroupId}
                                            className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md disabled:opacity-50"
                                        >
                                            {assignMode === 'individual' ? 'Assign Member' : 'Assign Group'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                {(selectedPlan.team || []).map((assignment, idx) => {
                                    const member = getMemberById(assignment.memberId);
                                    const role = getRoleById(assignment.role);
                                    const IconComp = role ? (Icons as any)[role.icon] : Icons.User;

                                    if (!member) return null;

                                    return (
                                        <div key={`${assignment.memberId}-${assignment.role}-${idx}`} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50">
                                            <div className="flex items-center gap-3">
                                                <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                                                <div>
                                                    <div className="font-medium">{member.name}</div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        {role && (
                                                            <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px]", role.color)}>
                                                                {IconComp && <IconComp className="w-2.5 h-2.5" />}
                                                            </div>
                                                        )}
                                                        <span className="text-xs text-muted-foreground">{role?.name || assignment.role}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {can('manage_events') && (
                                                <button
                                                    onClick={() => handleRemoveMember(assignment.memberId, assignment.role)}
                                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                                {(!selectedPlan.team || selectedPlan.team.length === 0) && (
                                    <div className="text-center py-8 text-muted-foreground text-sm">
                                        No team members assigned yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {editingEvent && (
                    <EditEventDialog
                        isOpen={!!editingEvent}
                        onClose={() => setEditingEvent(null)}
                        event={editingEvent}
                    />
                )}
            </div>
        );
    }

    // All events list view
    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-500 relative min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Events</h1>
                    <div className="text-sm text-muted-foreground mt-1">
                        {plans.length} Events
                    </div>
                </div>

                <div className="flex bg-secondary p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                            viewMode === 'list'
                                ? "bg-background shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <MoreHorizontal className="w-4 h-4 rotate-90" />
                        List
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                            viewMode === 'calendar'
                                ? "bg-background shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Calendar className="w-4 h-4" />
                        Calendar
                    </button>
                </div>
            </div>

            {viewMode === 'list' && (
                <div className="flex gap-4 border-b border-border pb-1">
                    <button
                        onClick={() => setFilterStatus('active')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                            filterStatus === 'active'
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilterStatus('archived')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                            filterStatus === 'archived'
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Archived
                    </button>
                </div>
            )}

            {viewMode === 'list' ? (
                filteredPlans.length === 0 ? (
                    <div className="bg-secondary/30 rounded-xl p-8 text-center border border-border/50">
                        <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">
                            {filterStatus === 'active'
                                ? 'No upcoming events. Create your first event!'
                                : 'No archived events.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredPlans.map(plan => (
                            <Card key={plan.id} className="overflow-visible cursor-pointer hover:border-primary/50 transition-colors">
                                <CardContent className="p-4 flex items-center justify-between relative group">
                                    <button
                                        onClick={() => handleSelectEvent(plan)}
                                        className="flex items-center space-x-4 flex-1 text-left"
                                    >
                                        <div className={`p-3 rounded-lg ${plan.color ? plan.color.replace('bg-', 'bg-opacity-10 bg-') + ' text-' + plan.color.replace('bg-', '') : 'bg-primary/10 text-primary'}`}>
                                            {plan.icon && (Icons as any)[plan.icon] ? (
                                                (() => {
                                                    const Icon = (Icons as any)[plan.icon];
                                                    return <Icon className="w-6 h-6" />;
                                                })()
                                            ) : (
                                                <Calendar className="w-6 h-6" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className={`font-semibold ${plan.isArchived ? 'text-muted-foreground line-through' : ''}`}>{plan.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{format(new Date(plan.date), 'EEEE, MMMM do')}</span>
                                                <span>•</span>
                                                <span>{format(new Date(plan.date), 'h:mm a')}</span>
                                            </div>
                                        </div>
                                    </button>

                                    <div className="relative">
                                        {can('manage_events') && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === plan.id ? null : plan.id);
                                                }}
                                                className="p-2 hover:bg-secondary rounded-full transition-colors opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                                                data-state={openMenuId === plan.id ? 'open' : 'closed'}
                                            >
                                                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                                            </button>
                                        )}

                                        {isDesktop && openMenuId === plan.id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-200">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingEvent(plan);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-secondary flex items-center gap-2"
                                                >
                                                    <Pencil className="w-4 h-4" /> Edit
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDuplicate(plan);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-secondary flex items-center gap-2"
                                                >
                                                    <Icons.Copy className="w-4 h-4" /> Duplicate
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleArchive(plan);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-secondary flex items-center gap-2"
                                                >
                                                    <Icons.Archive className="w-4 h-4" /> {plan.isArchived ? 'Unarchive' : 'Archive'}
                                                </button>
                                                <div className="h-px bg-border my-1" />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(plan.id);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )
            ) : (
                <EventsCalendar
                    plans={plans}
                    onSelectEvent={handleSelectEvent}
                    onAddEvent={(date: Date) => {
                        setPrefillDate(format(date, 'yyyy-MM-dd'));
                        setShowAddEvent(true);
                    }}
                />
            )}

            {/* FAB */}
            {can('manage_events') && (
                <button
                    onClick={() => {
                        setPrefillDate(undefined);
                        setShowAddEvent(true);
                    }}
                    className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors active:scale-95 z-40"
                >
                    <Plus className="w-7 h-7" />
                </button>
            )}

            {/* Mobile Action Drawer */}
            <Drawer open={!!openMenuId && !isDesktop} onOpenChange={(open) => !open && setOpenMenuId(null)}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Event Actions</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 space-y-2">
                        {(() => {
                            const plan = plans.find(p => p.id === openMenuId);
                            if (!plan) return null;
                            return (
                                <>
                                    <button
                                        onClick={() => {
                                            setEditingEvent(plan);
                                            setOpenMenuId(null);
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary flex items-center gap-3 font-medium transition-colors"
                                    >
                                        <Pencil className="w-5 h-5" /> Edit Event
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleDuplicate(plan);
                                            setOpenMenuId(null);
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary flex items-center gap-3 font-medium transition-colors"
                                    >
                                        <Icons.Copy className="w-5 h-5" /> Duplicate
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleArchive(plan);
                                            setOpenMenuId(null);
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary flex items-center gap-3 font-medium transition-colors"
                                    >
                                        <Icons.Archive className="w-5 h-5" /> {plan.isArchived ? 'Unarchive' : 'Archive'}
                                    </button>
                                    <div className="h-px bg-border my-2" />
                                    <button
                                        onClick={() => {
                                            handleDelete(plan.id);
                                            setOpenMenuId(null);
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center gap-3 font-medium transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" /> Delete Event
                                    </button>
                                </>
                            );
                        })()}
                    </div>
                    <DrawerFooter>
                        <button onClick={() => setOpenMenuId(null)} className="w-full py-3 font-medium text-muted-foreground">Cancel</button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            <AddEventDialog
                isOpen={showAddEvent}
                onClose={() => setShowAddEvent(false)}
                initialDate={prefillDate}
            />
            {editingEvent && (
                <EditEventDialog
                    isOpen={!!editingEvent}
                    onClose={() => setEditingEvent(null)}
                    event={editingEvent}
                />
            )}
        </div>
    );
}
