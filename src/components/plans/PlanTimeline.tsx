import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { PlanItem } from '../../types';
import { PlanItemCard } from './PlanItemCard';
import { PlanItemDialog } from './PlanItemDialog';

interface PlanTimelineProps {
    items: PlanItem[];
    onReorder: (items: PlanItem[]) => void;
    onUpdateItems: (items: PlanItem[]) => void;
}

export function PlanTimeline({ items, onReorder, onUpdateItems }: PlanTimelineProps) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editingItem, setEditingItem] = useState<PlanItem | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            onReorder(arrayMove(items, oldIndex, newIndex));
        }
    }

    const handleAddItem = (item: PlanItem) => {
        onUpdateItems([...items, item]);
    };

    const handleUpdateItem = (item: PlanItem) => {
        onUpdateItems(items.map(i => i.id === item.id ? item : i));
    };

    const handleDeleteItem = (id: string) => {
        onUpdateItems(items.filter(i => i.id !== id));
    };

    return (
        <div className="space-y-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {items.map((item) => (
                            <PlanItemCard
                                key={item.id}
                                item={item}
                                onEdit={setEditingItem}
                                onDelete={handleDeleteItem}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <button
                onClick={() => setShowAddDialog(true)}
                className="w-full py-3 border-2 border-dashed border-border rounded-lg flex items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add Timeline Item</span>
            </button>

            <PlanItemDialog
                isOpen={showAddDialog}
                onClose={() => setShowAddDialog(false)}
                onSave={handleAddItem}
            />

            {editingItem && (
                <PlanItemDialog
                    isOpen={!!editingItem}
                    onClose={() => setEditingItem(null)}
                    onSave={handleUpdateItem}
                    itemToEdit={editingItem}
                />
            )}
        </div>
    );
}
