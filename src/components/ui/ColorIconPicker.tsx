import { useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './sheet';

interface ColorIconPickerProps {
    color: string;
    icon: string;
    onColorChange: (color: string) => void;
    onIconChange: (icon: string) => void;
    label?: string;
}

const COLORS = [
    { name: 'Red', value: 'bg-red-500' },
    { name: 'Orange', value: 'bg-orange-500' },
    { name: 'Amber', value: 'bg-amber-500' },
    { name: 'Yellow', value: 'bg-yellow-500' },
    { name: 'Lime', value: 'bg-lime-500' },
    { name: 'Green', value: 'bg-green-500' },
    { name: 'Emerald', value: 'bg-emerald-500' },
    { name: 'Teal', value: 'bg-teal-500' },
    { name: 'Cyan', value: 'bg-cyan-500' },
    { name: 'Sky', value: 'bg-sky-500' },
    { name: 'Blue', value: 'bg-blue-500' },
    { name: 'Indigo', value: 'bg-indigo-500' },
    { name: 'Violet', value: 'bg-violet-500' },
    { name: 'Purple', value: 'bg-purple-500' },
    { name: 'Fuchsia', value: 'bg-fuchsia-500' },
    { name: 'Pink', value: 'bg-pink-500' },
    { name: 'Rose', value: 'bg-rose-500' },
    { name: 'Slate', value: 'bg-slate-500' },
];

const AVAILABLE_ICONS = [
    'Mic', 'Mic2', 'Guitar', 'Drum', 'Piano', 'Music', 'Music2', 'Music3', 'Music4',
    'Speaker', 'Radio', 'Headphones', 'User', 'Users', 'Shield', 'Star', 'Heart',
    'Zap', 'Camera', 'Video', 'Monitor', 'Smartphone', 'Tablet', 'Laptop',
    'Folder', 'FolderPlus', 'FolderOpen', 'File', 'FileText', 'Image', 'Calendar'
];

export function ColorIconPicker({ color, icon, onColorChange, onIconChange, label = "Appearance" }: ColorIconPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'color' | 'icon'>('color');

    const SelectedIcon = (Icons as any)[icon] || Icons.User;

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium block">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="w-full p-3 rounded-lg border border-input bg-background flex items-center justify-between hover:bg-secondary/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-md text-white shadow-sm", color)}>
                        <SelectedIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-medium">{icon}</div>
                        <div className="text-xs text-muted-foreground capitalize">{color.replace('bg-', '').replace('-500', '')}</div>
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Customize Appearance</SheetTitle>
                    </SheetHeader>

                    <div className="space-y-6 mt-6">
                        <div className="flex p-1 bg-secondary rounded-lg">
                            <button
                                type="button"
                                onClick={() => setActiveTab('color')}
                                className={cn(
                                    "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                                    activeTab === 'color' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Color
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('icon')}
                                className={cn(
                                    "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                                    activeTab === 'icon' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Icon
                            </button>
                        </div>

                        {activeTab === 'color' ? (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                {COLORS.map((c) => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => onColorChange(c.value)}
                                        className={cn(
                                            "aspect-square rounded-xl transition-all flex items-center justify-center relative group overflow-hidden",
                                            c.value,
                                            color === c.value ? "ring-2 ring-offset-2 ring-primary scale-105" : "hover:scale-105"
                                        )}
                                        title={c.name}
                                    >
                                        {color === c.value && (
                                            <div className="bg-black/20 absolute inset-0 flex items-center justify-center">
                                                <Check className="w-6 h-6 text-white" />
                                            </div>
                                        )}
                                        <span className="sr-only">{c.name}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                {AVAILABLE_ICONS.map((iconName) => {
                                    const IconComp = (Icons as any)[iconName];
                                    return (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => onIconChange(iconName)}
                                            className={cn(
                                                "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all border border-transparent",
                                                icon === iconName ? "bg-primary/10 border-primary text-primary" : "bg-secondary/50 hover:bg-secondary hover:border-border"
                                            )}
                                            title={iconName}
                                        >
                                            {IconComp && <IconComp className="w-6 h-6" />}
                                            <span className="text-[10px] truncate w-full text-center px-1">{iconName}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
