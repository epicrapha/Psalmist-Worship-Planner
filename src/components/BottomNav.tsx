import { NavLink } from 'react-router-dom';
import { Home, Music, Calendar, Users, User } from 'lucide-react';
import { cn } from '../lib/utils';

export function BottomNav() {
    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Music, label: 'Library', path: '/library' },
        { icon: Calendar, label: 'Events', path: '/events' },
        { icon: Users, label: 'Teams', path: '/teams' },
        { icon: User, label: 'Me', path: '/settings' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border pb-safe">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map(({ icon: Icon, label, path }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )
                        }
                    >
                        <Icon className="w-6 h-6" strokeWidth={2} />
                        <span className="text-[10px] font-medium">{label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
