import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Play, Pause, Settings2, Volume2, Pencil } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';
import { EditSongDialog } from '../components/library/EditSongDialog';

export function Rehearsal() {
    const { songId } = useParams();
    const navigate = useNavigate();
    const { songs } = useAppStore();
    const song = songs.find(s => s.id === songId);

    const [transpose, setTranspose] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showTools, setShowTools] = useState(true);
    const [fontSize, setFontSize] = useState(16);
    const [showEditDialog, setShowEditDialog] = useState(false);

    if (!song) return <div>Song not found</div>;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur z-10 sticky top-0">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-secondary rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h1 className="font-bold text-lg">{song.title}</h1>
                    <p className="text-xs text-muted-foreground">{song.artist} • {song.bpm} BPM • Key: {song.key}</p>
                </div>
                <div className="flex items-center space-x-1">
                    <button onClick={() => setShowEditDialog(true)} className="p-2 hover:bg-secondary rounded-full">
                        <Pencil className="w-5 h-5" />
                    </button>
                    <button onClick={() => setShowTools(!showTools)} className={cn("p-2 rounded-full transition-colors", showTools ? "bg-primary text-primary-foreground" : "hover:bg-secondary")}>
                        <Settings2 className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <EditSongDialog isOpen={showEditDialog} onClose={() => setShowEditDialog(false)} song={song} />

            {/* Main Content (Chord Chart) */}
            <div className="flex-1 p-4 overflow-y-auto" style={{ fontSize: `${fontSize}px` }}>
                <pre className="font-mono whitespace-pre-wrap leading-relaxed">
                    {song.lyrics.split('\n').map((line, i) => (
                        <div key={i} className="mb-4">
                            {/* Mock chord rendering logic - in real app, parse chords */}
                            {i % 2 === 0 && <div className="text-primary font-bold mb-1 opacity-80">{song.chords}</div>}
                            <div className="text-foreground">{line}</div>
                        </div>
                    ))}
                </pre>
            </div>

            {/* Tools Footer */}
            {showTools && (
                <div className="border-t border-border bg-background/95 backdrop-blur p-4 space-y-4 animate-in slide-in-from-bottom-10">
                    {/* Transpose & Font */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3 bg-secondary/50 rounded-lg p-1">
                            <button onClick={() => setTranspose(t => t - 1)} className="p-2 hover:bg-background rounded-md"><Minus className="w-4 h-4" /></button>
                            <span className="text-sm font-mono w-8 text-center">{transpose > 0 ? `+${transpose}` : transpose}</span>
                            <button onClick={() => setTranspose(t => t + 1)} className="p-2 hover:bg-background rounded-md"><Plus className="w-4 h-4" /></button>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">Aa</span>
                            <input
                                type="range"
                                min="12"
                                max="24"
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className="w-24 accent-primary"
                            />
                        </div>
                    </div>

                    {/* Metronome & Audio */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={cn(
                                "flex-1 flex items-center justify-center space-x-2 p-3 rounded-xl font-medium transition-colors",
                                isPlaying ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
                            )}
                        >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            <span>Metronome</span>
                        </button>

                        <button className="ml-3 p-3 rounded-xl bg-secondary text-foreground hover:bg-secondary/80">
                            <Volume2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
