import { Bell, Music, Calendar, Users, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAppStore } from '../../store/useAppStore';

export function NotificationCard() {
    const { notifications, markNotificationRead } = useAppStore();
    const unreadNotifications = notifications.filter(n => !n.read);

    if (unreadNotifications.length === 0) return null;

    return (
        <Card className="border-border/50">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Bell className="w-4 h-4 text-primary" />
                        Updates
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">{unreadNotifications.length} new</span>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {unreadNotifications.slice(0, 3).map(notification => (
                    <button
                        key={notification.id}
                        onClick={() => markNotificationRead(notification.id)}
                        className="w-full flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
                    >
                        <div className={`p-2 rounded-lg ${notification.type === 'assignment' ? 'bg-blue-500/10 text-blue-500' :
                                notification.type === 'update' ? 'bg-emerald-500/10 text-emerald-500' :
                                    'bg-amber-500/10 text-amber-500'
                            }`}>
                            {notification.type === 'assignment' ? <Users className="w-4 h-4" /> :
                                notification.type === 'update' ? <Music className="w-4 h-4" /> :
                                    <Calendar className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                            </p>
                        </div>
                    </button>
                ))}
            </CardContent>
        </Card>
    );
}

export function MetricsCard() {
    const { songs, plans, team } = useAppStore();

    const metrics = [
        { label: 'Songs', value: songs.length, icon: Music, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Events', value: plans.length, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Team', value: team.length, icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    ];

    return (
        <Card className="border-border/50">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Dashboard
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4">
                    {metrics.map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className="text-center">
                            <div className={`w-12 h-12 mx-auto rounded-xl ${bg} flex items-center justify-center mb-2`}>
                                <Icon className={`w-6 h-6 ${color}`} />
                            </div>
                            <div className="text-2xl font-bold">{value}</div>
                            <div className="text-xs text-muted-foreground">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Quick stats */}
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">This week</span>
                        <span className="font-medium text-emerald-500">+3 songs</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Upcoming</span>
                        <span className="font-medium">{plans.length} events</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
