import { Download, Share, Plus, Calendar, MoreHorizontal, Pencil, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PlanTimeline } from '../components/plans/PlanTimeline';
import { useAppStore } from '../store/useAppStore';
import { format } from 'date-fns';
import { Card, CardContent } from '../components/ui/card';
import { AddEventDialog } from '../components/events/AddEventDialog';
import { EditEventDialog } from '../components/events/EditEventDialog';
import type { ServicePlan } from '../types';

// Persist view state
let lastViewedEventId: string | null = null;

export function Plans() {
    const { plans, updatePlan } = useAppStore();
    const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [editingEvent, setEditingEvent] = useState<ServicePlan | null>(null);

    // Restore last viewed event on mount
    useEffect(() => {
        if (lastViewedEventId) {
            const lastEvent = plans.find(p => p.id === lastViewedEventId);
            if (lastEvent) {
                setSelectedPlan(lastEvent);
            }
        }
    }, []);

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

                <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                    <div className="flex justify-between text-sm text-muted-foreground mb-4 px-2">
                        <span>{selectedPlan.items.length} Items</span>
                        <span>Total: {Math.floor(selectedPlan.items.reduce((acc, i) => acc + i.duration, 0) / 60)} mins</span>
                    </div>

                    <PlanTimeline items={selectedPlan.items} onReorder={handleReorder} />
                </div>

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
