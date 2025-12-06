import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Clock, Music, BookOpen, Mic, FileText, Edit2, Trash2, UserPlus } from 'lucide-react';
import type { PlanItem } from '../../types';
import * as Icons from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface PlanItemCardProps {
    item: PlanItem;
    onEdit?: (item: PlanItem) => void;
    onDelete?: (id: string) => void;
}

export function PlanItemCard({ item, onEdit, onDelete }: PlanItemCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const { teams, currentTeamId } = useAppStore();
    const currentTeam = teams.find(t => t.id === currentTeamId);
    const members = currentTeam?.members || [];

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getIcon = () => {
        if (item.icon && (Icons as any)[item.icon]) {
            const CustomIcon = (Icons as any)[item.icon];
            return <CustomIcon className="w-5 h-5" />;
        }
        // Fallback based on type
        switch (item.type) {
            case 'song': return <Music className="w-5 h-5" />;
            case 'reading': return <BookOpen className="w-5 h-5" />;
            case 'media': return <FileText className="w-5 h-5" />;
            default: return <Mic className="w-5 h-5" />;
        }
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return '0:00';
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const assignees = item.assignees?.map(id => members.find(m => m.id === id)).filter(Boolean) || [];

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group bg-background border border-border/50 rounded-lg p-3 flex items-center gap-4 hover:border-primary/50 transition-all hover:shadow-sm"
        >
            <button
                {...attributes}
                {...listeners}
                className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
            >
                <GripVertical className="w-5 h-5" />
            </button>

            <div className={`p-2 rounded-lg ${item.color || 'bg-secondary'} bg-opacity-10 text-primary`}>
                {getIcon()}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex justify-between items-center">
                    <h4 className="font-medium truncate">{item.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(item.duration)}</span>
                        </div>
                    </div>
                </div>

                {(item.description || item.notes) && (
                    <p className="text-sm text-muted-foreground line-clamp-1">{item.description || item.notes}</p>
                )}

                {assignees.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                        <div className="flex -space-x-2">
                            {assignees.map(member => (
                                <img
                                    key={member?.id}
                                    src={member?.avatar}
                                    alt={member?.name}
                                    className="w-5 h-5 rounded-full border-2 border-background object-cover"
                                    title={member?.name}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                {onEdit && (
                    <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Assign / Edit"
                    >
                        <UserPlus className="w-4 h-4" />
                    </button>
                )}
                {onEdit && (
                    <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                        title="Edit Item"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={() => {
                            if (confirm('Delete this item?')) onDelete(item.id);
                        }}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Delete Item"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
