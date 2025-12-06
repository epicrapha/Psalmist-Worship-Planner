import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '../ui/sheet';
import type { PlanItem } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { ColorIconPicker } from '../ui/ColorIconPicker';
import { Check } from 'lucide-react';


interface PlanItemDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: PlanItem) => void;
    itemToEdit?: PlanItem;
}

const ITEM_TYPES = [
    { value: 'song', label: 'Song' },
    { value: 'reading', label: 'Reading' },
    { value: 'media', label: 'Media' },
    { value: 'generic', label: 'Generic' },
];

export function PlanItemDialog({ isOpen, onClose, onSave, itemToEdit }: PlanItemDialogProps) {
    const { teams, currentTeamId } = useAppStore();
    const currentTeam = teams.find(t => t.id === currentTeamId);
    const members = currentTeam?.members || [];

    const [type, setType] = useState<PlanItem['type'] | 'generic'>('generic');
    const [title, setTitle] = useState('');
    const [durationMin, setDurationMin] = useState(5);
    const [durationSec, setDurationSec] = useState(0);
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('bg-gray-500');
    const [icon, setIcon] = useState('Circle');
    const [assignees, setAssignees] = useState<string[]>([]);

    // Reset or populate form
    useEffect(() => {
        if (isOpen) {
            if (itemToEdit) {
                setType(itemToEdit.type || 'generic');
                setTitle(itemToEdit.title);
                const mins = Math.floor(itemToEdit.duration / 60);
                const secs = itemToEdit.duration % 60;
                setDurationMin(mins);
                setDurationSec(secs);
                setDescription(itemToEdit.description || itemToEdit.notes || '');
                setColor(itemToEdit.color || 'bg-gray-500');
                setIcon(itemToEdit.icon || 'Circle');
                setAssignees(itemToEdit.assignees || []);
            } else {
                setType('generic');
                setTitle('');
                setDurationMin(5);
                setDurationSec(0);
                setDescription('');
                setColor('bg-gray-500');
                setIcon('Circle');
                setAssignees([]);
            }
        }
    }, [isOpen, itemToEdit]);

    const handleSave = () => {
        if (!title.trim()) return;

        const newItem: PlanItem = {
            id: itemToEdit?.id || crypto.randomUUID(),
            type: type as any,
            title,
            duration: (durationMin * 60) + durationSec,
            description,
            color,
            icon,
            assignees,
            notes: description, // Keep sync for backward compat if needed
        };

        onSave(newItem);
        onClose();
    };

    const toggleAssignee = (memberId: string) => {
        setAssignees(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{itemToEdit ? 'Edit Item' : 'Add Item'}</SheetTitle>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                    {/* Type & Title */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1">
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as any)}
                                className="w-full p-2 rounded-md bg-secondary border-transparent text-sm h-10"
                            >
                                {ITEM_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-3">
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Item Title"
                                className="w-full p-2 rounded-md bg-secondary border-transparent text-sm h-10"
                            />
                        </div>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Duration</label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 flex items-center gap-2 bg-secondary rounded-md px-2">
                                <input
                                    type="number"
                                    min="0"
                                    value={durationMin}
                                    onChange={(e) => setDurationMin(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full p-2 bg-transparent border-none text-right focus:outline-none"
                                />
                                <span className="text-sm text-muted-foreground pr-2">min</span>
                            </div>
                            <div className="flex-1 flex items-center gap-2 bg-secondary rounded-md px-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={durationSec}
                                    onChange={(e) => setDurationSec(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                                    className="w-full p-2 bg-transparent border-none text-right focus:outline-none"
                                />
                                <span className="text-sm text-muted-foreground pr-2">sec</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Description / Notes</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add details, lyrics, or notes..."
                            className="w-full p-2 rounded-md bg-secondary border-transparent text-sm min-h-[80px]"
                        />
                    </div>

                    {/* Appearance */}
                    <ColorIconPicker
                        color={color}
                        icon={icon}
                        onColorChange={setColor}
                        onIconChange={setIcon}
                    />

                    {/* Assignees */}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">Assignees</label>
                        <div className="flex flex-wrap gap-2">
                            {members.map(member => {
                                const isSelected = assignees.includes(member.id);
                                return (
                                    <button
                                        key={member.id}
                                        onClick={() => toggleAssignee(member.id)}
                                        className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs border transition-all ${isSelected
                                            ? 'bg-primary/10 border-primary text-primary'
                                            : 'bg-secondary border-transparent text-muted-foreground hover:bg-secondary/80'
                                            }`}
                                    >
                                        <img src={member.avatar} alt={member.name} className="w-4 h-4 rounded-full" />
                                        <span>{member.name}</span>
                                        {isSelected && <Check className="w-3 h-3" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <SheetFooter className="mt-8">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!title.trim()}
                            className="px-4 py-2 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                        >
                            Save Item
                        </button>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    );
}
