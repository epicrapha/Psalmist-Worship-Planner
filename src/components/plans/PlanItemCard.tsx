import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Music, Mic, MonitorPlay, Clock } from 'lucide-react';
import type { PlanItem } from '../../types';
import { cn } from '../../lib/utils';

interface PlanItemCardProps {
    item: PlanItem;
}

export function PlanItemCard({ item }: PlanItemCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    const getIcon = () => {
        switch (item.type) {
            case 'song': return <Music className="w-4 h-4 text-primary" />;
            case 'reading': return <Mic className="w-4 h-4 text-emerald-500" />;
            case 'media': return <MonitorPlay className="w-4 h-4 text-amber-500" />;
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "bg-card border rounded-xl p-3 flex items-center space-x-3 shadow-sm touch-none select-none",
                isDragging && "shadow-xl ring-2 ring-primary opacity-90 scale-105"
            )}
        >
            <div {...attributes} {...listeners} className="text-muted-foreground cursor-grab active:cursor-grabbing p-1">
                <GripVertical className="w-5 h-5" />
            </div>

            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                {getIcon()}
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{item.title}</h3>
                {item.notes && <p className="text-xs text-muted-foreground truncate">{item.notes}</p>}
            </div>

            <div className="flex items-center space-x-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                <Clock className="w-3 h-3" />
                <span>{Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}</span>
            </div>
        </div>
    );
}
