import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Song } from '../../types';
import { Card, CardContent } from '../ui/card';

interface RecentSongsProps {
    songs: Song[];
}

export function RecentSongs({ songs }: RecentSongsProps) {
    const navigate = useNavigate();

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <h2 className="text-lg font-semibold tracking-tight">Recently Used</h2>
                <button className="text-sm text-primary hover:underline">View All</button>
            </div>

            <div className="flex space-x-4 overflow-x-auto pb-4 px-1 -mx-4 md:mx-0 px-4 md:px-0 scrollbar-hide">
                {songs.map((song) => (
                    <Card
                        key={song.id}
                        onClick={() => navigate(`/rehearsal/${song.id}`)}
                        className="min-w-[160px] w-[160px] flex-shrink-0 group cursor-pointer hover:border-primary/50 transition-colors"
                    >
                        <CardContent className="p-4 space-y-3">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                            </div>
                            <div>
                                <h3 className="font-semibold truncate">{song.title}</h3>
                                <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-medium uppercase">{song.key}</span>
                                <span>{song.bpm} BPM</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
