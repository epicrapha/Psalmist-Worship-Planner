import { Bell } from 'lucide-react';
import { HeroCard } from '../components/home/HeroCard';
import { QuickActions } from '../components/home/QuickActions';
import { RecentSongs } from '../components/home/RecentSongs';
import { NotificationCard, MetricsCard } from '../components/home/DashboardCards';
import { useAppStore } from '../store/useAppStore';

export function Home() {
    const { user, plans, songs } = useAppStore();
    const nextService = plans[0];

    // Get greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning,';
        if (hour < 17) return 'Good afternoon,';
        return 'Good evening,';
    };

    return (
        <div className="space-y-8 pb-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center px-1">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{getGreeting()}</h1>
                    <p className="text-muted-foreground">{user?.name}</p>
                </div>
                <button
                    onClick={() => alert('No new notifications')}
                    className="relative p-2 rounded-full hover:bg-secondary transition-colors"
                >
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
                </button>
            </div>

            {/* Hero */}
            {nextService && <HeroCard nextService={nextService} />}

            {/* Notifications */}
            <NotificationCard />

            {/* Quick Actions */}
            <QuickActions />

            {/* Dashboard Metrics */}
            <MetricsCard />

            {/* Recent Songs */}
            <RecentSongs songs={songs} />
        </div>
    );
}
