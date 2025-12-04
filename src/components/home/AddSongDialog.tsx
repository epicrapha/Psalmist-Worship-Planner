import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Dialog } from '../ui/dialog';
import type { Song } from '../../types';
import { ChevronDown, Plus } from 'lucide-react';

const MUSICAL_KEYS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

interface AddSongDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddSongDialog({ isOpen, onClose }: AddSongDialogProps) {
    const { addSong, customTags, addCustomTag } = useAppStore();
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        key: '',
        bpm: '',
        tags: [] as string[],
    });
    const [showKeyPicker, setShowKeyPicker] = useState(false);
    const [showTagPicker, setShowTagPicker] = useState(false);
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [newTagValue, setNewTagValue] = useState('');
    const newTagInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isAddingTag && newTagInputRef.current) {
            newTagInputRef.current.focus();
        }
    }, [isAddingTag]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newSong: Song = {
            id: Math.random().toString(36).substr(2, 9),
            title: formData.title,
            artist: formData.artist,
            key: formData.key,
            bpm: Number(formData.bpm) || 120,
            tags: formData.tags,
            lyrics: '',
            chords: '',
        };
        addSong(newSong);
        onClose();
        setFormData({ title: '', artist: '', key: '', bpm: '', tags: [] });
    };

    const toggleTag = (tag: string) => {
        if (formData.tags.includes(tag)) {
            setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
        } else {
            setFormData({ ...formData, tags: [...formData.tags, tag] });
        }
    };

    const handleAddTag = () => {
        if (newTagValue.trim()) {
            addCustomTag(newTagValue.trim());
            setFormData({ ...formData, tags: [...formData.tags, newTagValue.trim()] });
            setNewTagValue('');
            setIsAddingTag(false);
        }
    };

    const closeAllPickers = () => {
        setShowKeyPicker(false);
        setShowTagPicker(false);
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Add New Song">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-medium block">Title</label>
                    <input
                        required
                        placeholder="Song title"
                        className="w-full p-3 rounded-lg border border-input bg-background"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium block">Artist</label>
                    <input
                        required
                        placeholder="Artist name"
                        className="w-full p-3 rounded-lg border border-input bg-background"
                        value={formData.artist}
                        onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {/* Key Picker */}
                    <div className="space-y-2 relative">
                        <label className="text-sm font-medium block">Key</label>
                        <button
                            type="button"
                            onClick={() => { closeAllPickers(); setShowKeyPicker(!showKeyPicker); }}
                            className="w-full p-3 rounded-lg border border-input bg-background flex justify-between items-center"
                        >
                            <span className={formData.key ? '' : 'text-muted-foreground'}>{formData.key || 'Select'}</span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {showKeyPicker && (
                            <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg p-2 max-h-48 overflow-y-auto">
                                <div className="grid grid-cols-4 gap-1">
                                    {MUSICAL_KEYS.map(key => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => { setFormData({ ...formData, key }); setShowKeyPicker(false); }}
                                            className={`p-2 rounded text-sm font-medium transition-colors ${formData.key === key ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                                        >
                                            {key}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium block">BPM</label>
                        <input
                            type="number"
                            placeholder="120"
                            className="w-full p-3 rounded-lg border border-input bg-background"
                            value={formData.bpm}
                            onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                        />
                    </div>
                </div>

                {/* Tags Picker */}
                <div className="space-y-2 relative">
                    <label className="text-sm font-medium block">Tags</label>
                    <button
                        type="button"
                        onClick={() => { closeAllPickers(); setShowTagPicker(!showTagPicker); }}
                        className="w-full p-3 rounded-lg border border-input bg-background flex justify-between items-center"
                    >
                        <div className="flex flex-wrap gap-1">
                            {formData.tags.length > 0 ? formData.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{tag}</span>
                            )) : <span className="text-muted-foreground">Select tags</span>}
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </button>
                    {showTagPicker && (
                        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg p-3 max-h-64 overflow-y-auto">
                            <div className="flex flex-wrap gap-2">
                                {customTags.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.tags.includes(tag) ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                                {isAddingTag ? (
                                    <input
                                        ref={newTagInputRef}
                                        type="text"
                                        placeholder="Tag name"
                                        className="px-3 py-1.5 rounded-full text-sm font-medium bg-secondary border border-primary w-24"
                                        value={newTagValue}
                                        onChange={(e) => setNewTagValue(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } else if (e.key === 'Escape') { setIsAddingTag(false); setNewTagValue(''); } }}
                                        onBlur={() => { if (!newTagValue.trim()) setIsAddingTag(false); }}
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingTag(true)}
                                        className="px-3 py-1.5 rounded-full text-sm font-medium bg-secondary hover:bg-secondary/80 flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        className="px-6 py-2.5 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                        Add Song
                    </button>
                </div>
            </form>
        </Dialog>
    );
}
