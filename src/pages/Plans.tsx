import { Download, Share, Plus, Calendar, MoreHorizontal, Pencil, ArrowLeft, Users, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PlanTimeline } from '../components/plans/PlanTimeline';
import { useAppStore } from '../store/useAppStore';
import { format } from 'date-fns';
import { Card, CardContent } from '../components/ui/card';
import { AddEventDialog } from '../components/events/AddEventDialog';
import { EditEventDialog } from '../components/events/EditEventDialog';
import type { ServicePlan } from '../types';
import { cn } from '../lib/utils';
import * as Icons from 'lucide-react';

// Persist view state
let lastViewedEventId: string | null = null;

export function Plans() {
    const { plans, updatePlan, team, customRoles } = useAppStore();
    const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [editingEvent, setEditingEvent] = useState<ServicePlan | null>(null);
    const [activeTab, setActiveTab] = useState<'timeline' | 'team'>('timeline');

    // Team assignment state
    const [isAssigning, setIsAssigning] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [selectedRoleId, setSelectedRoleId] = useState('');

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

    const handleRemoveMember = (memberId: string, roleId: string) => {
        if (selectedPlan) {
            const newTeam = (selectedPlan.team || []).filter(
                t => !(t.memberId === memberId && t.role === roleId)
            );
            updatePlan(selectedPlan.id, { team: newTeam });
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
                        <h1 className="text-3xl font-bold tracking-tight">{selectedPlan.title}</h1>
                        <p className="text-muted-foreground">{format(new Date(selectedPlan.date), 'EEEE, MMMM do, yyyy • h:mm a')}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setEditingEvent(selectedPlan)}
                            className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <Pencil className="w-5 h-5" />
                        </button>
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

                        <PlanTimeline items={selectedPlan.items} onReorder={handleReorder} />
                    </div>
                )}

                {activeTab === 'team' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold">Assigned Team</h3>
                                <button
                                    onClick={() => setIsAssigning(!isAssigning)}
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    Assign Member
                                </button>
                            </div>

                            {isAssigning && (
                                <div className="bg-background p-4 rounded-lg border border-border mb-4 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Member</label>
                                            <select
                                                className="w-full p-2 rounded-md bg-secondary border-transparent text-sm"
                                                value={selectedMemberId}
                                                onChange={(e) => setSelectedMemberId(e.target.value)}
                                            >
                                                <option value="">Select Member</option>
                                                {team.map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
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
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setIsAssigning(false)} className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                                        <button
                                            onClick={handleAssignMember}
                                            disabled={!selectedMemberId || !selectedRoleId}
                                            className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md disabled:opacity-50"
                                        >
                                            Assign
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
                                            <button
                                                onClick={() => handleRemoveMember(assignment.memberId, assignment.role)}
                                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
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
                <h1 className="text-3xl font-bold tracking-tight">Events</h1>
                <div className="text-sm text-muted-foreground">
                    {plans.length} Events
                </div>
            </div>

            {plans.length === 0 ? (
                <div className="bg-secondary/30 rounded-xl p-8 text-center border border-border/50">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No events yet. Create your first event!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {plans.map(plan => (
                        <Card key={plan.id} className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors">
                            <CardContent className="p-4 flex items-center justify-between">
                                <button
                                    onClick={() => handleSelectEvent(plan)}
                                    className="flex items-center space-x-4 flex-1 text-left"
                                >
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <Calendar className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{plan.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(plan.date), 'EEEE, MMMM do • h:mm a')}
                                        </p>
                                    </div>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingEvent(plan);
                                    }}
                                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                                >
                                    <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* FAB */}
            <button
                onClick={() => setShowAddEvent(true)}
                className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors active:scale-95 z-40"
            >
                <Plus className="w-7 h-7" />
            </button>

            <AddEventDialog isOpen={showAddEvent} onClose={() => setShowAddEvent(false)} />
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
