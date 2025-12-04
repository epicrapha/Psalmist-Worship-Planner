import { Cloud, LogOut, Moon, Sun, Laptop, Check, Music } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAppStore } from '../store/useAppStore';
import { Card, CardContent } from '../components/ui/card';

export function Settings() {
    const { theme, setTheme } = useTheme();
    const { user, spotifyConnected, setSpotifyConnected } = useAppStore();

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>

            {/* Profile Section */}
            <Card>
                <CardContent className="p-4 flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-secondary overflow-hidden">
                        <img src={user?.avatar} alt={user?.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">{user?.name}</h2>
                        <p className="text-sm text-muted-foreground">{user?.role}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Appearance */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground px-1">Appearance</h3>
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Moon className="w-5 h-5" />
                                <span>Theme</span>
                            </div>
                            <div className="flex bg-secondary p-1 rounded-lg">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`p-1.5 rounded-md transition-all ${theme === 'light' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                                >
                                    <Sun className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`p-1.5 rounded-md transition-all ${theme === 'dark' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                                >
                                    <Moon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setTheme('system')}
                                    className={`p-1.5 rounded-md transition-all ${theme === 'system' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                                >
                                    <Laptop className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Integrations */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground px-1">Integrations</h3>
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                    <Cloud className="w-5 h-5" />
                                </div>
                                <span className="font-medium">Google Drive</span>
                            </div>
                            <div className="flex items-center text-emerald-500 text-xs font-medium">
                                <Check className="w-3 h-3 mr-1" />
                                Connected
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                                    <Music className="w-5 h-5" />
                                </div>
                                <span className="font-medium">Spotify</span>
                            </div>
                            <button
                                onClick={() => setSpotifyConnected(!spotifyConnected)}
                                className={`text-xs font-medium hover:underline ${spotifyConnected ? 'text-emerald-500' : 'text-primary'}`}
                            >
                                {spotifyConnected ? 'Connected' : 'Connect'}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <button
                onClick={() => {
                    if (confirm('Are you sure you want to log out?')) {
                        alert('Logged out successfully (Mock)');
                    }
                }}
                className="w-full p-4 rounded-xl bg-destructive/10 text-destructive font-medium flex items-center justify-center space-x-2 hover:bg-destructive/20 transition-colors"
            >
                <LogOut className="w-5 h-5" />
                <span>Log Out</span>
            </button>
        </div>
    );
}
