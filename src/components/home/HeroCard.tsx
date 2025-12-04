import { format } from 'date-fns';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { ServicePlan } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface HeroCardProps {
    nextService: ServicePlan;
}

export function HeroCard({ nextService }: HeroCardProps) {
    const navigate = useNavigate();
    const { team, user } = useAppStore();
    const serviceDate = new Date(nextService.date);

    // Mock assignments for the current user
    const userAssignments = ['Worship Leader', 'Vocalist'];
    const otherTasks = userAssignments.length - 1;

    return (
        <Card
            onClick={() => navigate('/events')}
            className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none overflow-hidden relative cursor-pointer hover:shadow-xl transition-shadow"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />

            <CardHeader className="pb-2 relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-primary-foreground/80 text-sm font-medium uppercase tracking-wider">Upcoming Event</p>
                        <CardTitle className="text-3xl mt-1">{nextService.title}</CardTitle>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative z-10">
                <div className="space-y-3 mt-4">
                    <div className="flex items-center space-x-3 text-primary-foreground/90">
                        <Clock className="w-5 h-5" />
                        <span className="text-lg font-medium">
                            {format(serviceDate, 'EEEE, MMMM do')} • {format(serviceDate, 'h:mm a')}
                        </span>
                    </div>
                    <div className="flex items-center space-x-3 text-primary-foreground/80">
                        <MapPin className="w-5 h-5" />
                        <span>Main Sanctuary</span>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center">
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate('/teams'); }}
                        className="flex -space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        {team.slice(0, 3).map((member) => (
                            <div key={member.id} className="w-8 h-8 rounded-full border-2 border-primary bg-background flex items-center justify-center text-xs text-foreground font-bold">
                                <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                            </div>
                        ))}
                        {team.length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-primary bg-background/50 backdrop-blur-sm flex items-center justify-center text-[10px] font-medium text-white">
                                +{team.length - 3}
                            </div>
                        )}
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                            {user?.roles?.[0] || 'Member'}
                            {otherTasks > 0 && <span className="opacity-80">, +{otherTasks} more</span>}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
