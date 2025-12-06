import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { format } from 'date-fns';
import {
    Clock,
    ChevronRight,
    ChevronLeft,
    Monitor,
    Music,
    Mic2,
    Maximize2,
    Minimize2
} from 'lucide-react';
import { cn } from '../lib/utils';


export function LiveService() {
    const { planId } = useParams<{ planId: string }>();
    const navigate = useNavigate();
    const { teams, currentTeamId } = useAppStore();
    const currentTeam = teams.find(t => t.id === currentTeamId);
    const plan = currentTeam?.plans.find(p => p.id === planId);

    // State
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeItemIndex, setActiveItemIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!plan) {
        return <div className="p-8 text-center">Plan not found</div>;
    }

    const currentItem = plan.items[activeItemIndex];
    const nextItem = plan.items[activeItemIndex + 1];

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const handleNext = () => {
        if (activeItemIndex < plan.items.length - 1) {
            setActiveItemIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (activeItemIndex > 0) {
            setActiveItemIndex(prev => prev - 1);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Top Bar */}
            <div className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
                        Back
                    </button>
                    <div className="h-6 w-px bg-border mx-2" />
                    <h1 className="font-bold text-xl">{plan.title}</h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-xl font-mono font-bold text-primary">
                        <Clock className="w-5 h-5" />
                        {format(currentTime, 'h:mm:ss a')}
                    </div>
                    <button onClick={toggleFullscreen} className="p-2 hover:bg-secondary rounded-full">
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content - Current Item */}
                <div className="flex-1 p-8 flex flex-col items-center justify-center bg-background relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-secondary">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${((activeItemIndex + 1) / plan.items.length) * 100}%` }}
                        />
                    </div>

                    <div className="text-center space-y-8 max-w-4xl w-full">
                        <div className="text-muted-foreground text-lg uppercase tracking-widest font-medium">
                            Current Item ({activeItemIndex + 1} / {plan.items.length})
                        </div>

                        <div className="p-12 rounded-3xl bg-secondary/30 border border-border/50 animate-in zoom-in-95 duration-300">
                            <div className="flex justify-center mb-6">
                                {currentItem.type === 'song' && <Music className="w-16 h-16 text-primary" />}
                                {currentItem.type === 'reading' && <Mic2 className="w-16 h-16 text-emerald-500" />}
                                {currentItem.type === 'media' && <Monitor className="w-16 h-16 text-blue-500" />}
                            </div>
                            <h2 className="text-6xl font-black tracking-tight mb-4">{currentItem.title}</h2>
                            {currentItem.description && (
                                <p className="text-2xl text-muted-foreground">{currentItem.description}</p>
                            )}
                            <p className="mt-8 text-xl font-mono opacity-60">
                                Duration: {Math.floor(currentItem.duration / 60)}:{(currentItem.duration % 60).toString().padStart(2, '0')}
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="absolute bottom-12 flex gap-4">
                        <button
                            onClick={handlePrev}
                            disabled={activeItemIndex === 0}
                            className="p-4 rounded-full bg-secondary hover:bg-secondary/80 disabled:opacity-50 transition-all active:scale-95"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={activeItemIndex === plan.items.length - 1}
                            className="p-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 disabled:opacity-50 transition-all active:scale-95"
                        >
                            <ChevronRight className="w-10 h-10" />
                        </button>
                    </div>
                </div>

                {/* Sidebar - Up Next */}
                <div className="w-96 border-l border-border bg-card p-6 flex flex-col">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        Up Next
                    </h3>

                    {nextItem ? (
                        <div className="p-6 rounded-xl bg-secondary/50 border border-border/50 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "p-3 rounded-lg",
                                    nextItem.type === 'song' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                )}>
                                    {nextItem.type === 'song' ? <Music className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                                </div>
                                <div>
                                    <div className="font-bold text-lg leading-tight">{nextItem.title}</div>
                                    <div className="text-sm text-muted-foreground mt-1 capitalize">{nextItem.type}</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-muted-foreground italic">End of service</div>
                    )}

                    <div className="mt-auto">
                        <h4 className="font-medium mb-3">Service Progress</h4>
                        <div className="space-y-2">
                            {plan.items.map((item, idx) => (
                                <div
                                    key={item.id}
                                    onClick={() => setActiveItemIndex(idx)}
                                    className={cn(
                                        "p-2 rounded cursor-pointer text-sm flex items-center justify-between transition-colors",
                                        idx === activeItemIndex ? "bg-primary text-primary-foreground font-medium" :
                                            idx < activeItemIndex ? "text-muted-foreground line-through opacity-50" :
                                                "hover:bg-secondary"
                                    )}
                                >
                                    <span className="truncate">{idx + 1}. {item.title}</span>
                                    <span className="text-xs opacity-70">
                                        {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
