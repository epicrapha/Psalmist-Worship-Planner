import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Dialog } from '../ui/dialog';
import type { Song } from '../../types';
import { ChevronDown } from 'lucide-react';

const MUSICAL_KEYS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
const AVAILABLE_TAGS = ['Worship', 'Contemporary', 'Hymn', 'Fast', 'Slow', 'Intimate', 'Praise', 'Gospel'];

interface EditSongDialogProps {
    isOpen: boolean;
    onClose: () => void;
    song: Song;
}

export function EditSongDialog({ isOpen, onClose, song }: EditSongDialogProps) {
    const { updateSong } = useAppStore();
    const [formData, setFormData] = useState({
        title: song.title,
        artist: song.artist,
        key: song.key,
        bpm: song.bpm.toString(),
        tags: song.tags,
        lyrics: song.lyrics,
        chords: song.chords,
        youtubeLink: song.youtubeLink || '',
    });
    const [showKeyPicker, setShowKeyPicker] = useState(false);
    const [showTagPicker, setShowTagPicker] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSong(song.id, {
            title: formData.title,
            artist: formData.artist,
            key: formData.key,
            bpm: Number(formData.bpm),
            tags: formData.tags,
            lyrics: formData.lyrics,
            chords: formData.chords,
            youtubeLink: formData.youtubeLink || undefined,
        });
        onClose();
    };

    const toggleTag = (tag: string) => {
        if (formData.tags.includes(tag)) {
            setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
        } else {
            setFormData({ ...formData, tags: [...formData.tags, tag] });
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Edit Song">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <input
                        required
                        className="w-full p-2 rounded-md border border-input bg-background"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Artist</label>
                    <input
                        required
                        className="w-full p-2 rounded-md border border-input bg-background"
                        value={formData.artist}
                        onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {/* Key Picker */}
                    <div className="space-y-2 relative">
                        <label className="text-sm font-medium">Key</label>
                        <button
                            type="button"
                            onClick={() => setShowKeyPicker(!showKeyPicker)}
                            className="w-full p-2 rounded-md border border-input bg-background flex justify-between items-center"
                        >
                            <span>{formData.key || 'Select key'}</span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {showKeyPicker && (
                            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg p-2 max-h-48 overflow-y-auto">
                                <div className="grid grid-cols-4 gap-1">
                                    {MUSICAL_KEYS.map(key => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...formData, key });
                                                setShowKeyPicker(false);
                                            }}
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
                        <label className="text-sm font-medium">BPM</label>
                        <input
                            type="number"
                            className="w-full p-2 rounded-md border border-input bg-background"
                            value={formData.bpm}
                            onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                        />
                    </div>
                </div>

                {/* Tags */}
                <div className="space-y-2 relative">
                    <label className="text-sm font-medium">Tags</label>
                    <button
                        type="button"
                        onClick={() => setShowTagPicker(!showTagPicker)}
                        className="w-full p-2 rounded-md border border-input bg-background flex justify-between items-center"
                    >
                        <div className="flex flex-wrap gap-1">
                            {formData.tags.length > 0 ? formData.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{tag}</span>
                            )) : <span className="text-muted-foreground">Select tags</span>}
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </button>
                    {showTagPicker && (
                        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg p-3">
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_TAGS.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.tags.includes(tag) ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Lyrics */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Lyrics</label>
                    <textarea
                        rows={4}
                        className="w-full p-2 rounded-md border border-input bg-background resize-none"
                        value={formData.lyrics}
                        onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
                        placeholder="Enter song lyrics..."
                    />
                </div>

                {/* Chords */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Chords</label>
                    <input
                        className="w-full p-2 rounded-md border border-input bg-background font-mono"
                        value={formData.chords}
                        onChange={(e) => setFormData({ ...formData, chords: e.target.value })}
                        placeholder="e.g. C G Am F"
                    />
                </div>

                {/* YouTube Link */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">YouTube Link (optional)</label>
                    <input
                        className="w-full p-2 rounded-md border border-input bg-background"
                        value={formData.youtubeLink}
                        onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
                        placeholder="https://youtube.com/..."
                    />
                </div>

                <div className="pt-4 flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-md transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </Dialog>
    );
}
