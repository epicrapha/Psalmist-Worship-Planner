import { MoreHorizontal, Shield, User, Music, Guitar } from 'lucide-react';
import type { TeamMember } from '../../types';
import { Card, CardContent } from '../ui/card';

interface TeamRosterProps {
    team: TeamMember[];
    onEditMember?: (member: TeamMember) => void;
}

const getRoleIcon = (role: string) => {
    const lowercaseRole = role.toLowerCase();
    if (lowercaseRole === 'admin') return <Shield className="w-4 h-4 text-primary fill-primary/20" />;
    if (lowercaseRole === 'leader') return <Shield className="w-4 h-4 text-amber-500 fill-amber-500/20" />;
    if (lowercaseRole.includes('vocal') || lowercaseRole.includes('singer')) return <Music className="w-4 h-4 text-pink-500" />;
    if (lowercaseRole.includes('guitar') || lowercaseRole.includes('bass')) return <Guitar className="w-4 h-4 text-orange-500" />;
    return <User className="w-4 h-4 text-muted-foreground" />;
};

export function TeamRoster({ team, onEditMember }: TeamRosterProps) {
    return (
        <div className="space-y-3">
            {team.map((member) => (
                <Card key={member.id} className="overflow-hidden">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <img
                                    src={member.avatar}
                                    alt={member.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-background shadow-sm"
                                />
                                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                                    {getRoleIcon(member.role)}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold">{member.name}</h3>
                                <p className="text-xs text-muted-foreground">{member.role}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => onEditMember?.(member)}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
