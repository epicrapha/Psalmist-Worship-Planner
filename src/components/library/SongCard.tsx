import { Music, HardDrive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Song } from '../../types';
import { Card, CardContent } from '../ui/card';

interface SongCardProps {
    song: Song;
}

export function SongCard({ song }: SongCardProps) {
    const navigate = useNavigate();

    return (
        <Card
            onClick={() => navigate(`/rehearsal/${song.id}`)}
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
        >
            <CardContent className="p-0">
                <div className="h-24 bg-secondary/50 relative p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-primary">
                            <Music className="w-4 h-4" />
                        </div>
                        {song.driveLink && (
                            <HardDrive className="w-4 h-4 text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex space-x-2">
                        {song.tags.map(tag => (
                            <span key={tag} className="text-[10px] font-medium bg-background/50 backdrop-blur-sm px-2 py-0.5 rounded-full text-foreground/80">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="p-4 space-y-1">
                    <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">{song.title}</h3>
                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                    <div className="flex items-center space-x-3 mt-3 text-xs text-muted-foreground font-medium">
                        <span className="bg-secondary px-1.5 py-0.5 rounded text-foreground">{song.key}</span>
                        <span>{song.bpm} BPM</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
