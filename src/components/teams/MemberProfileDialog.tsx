import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import type { TeamMember } from '../../types';
import * as Icons from 'lucide-react';
import { Calendar, Mail, Phone, PenSquare } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { format } from 'date-fns';

interface MemberProfileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    member: TeamMember;
    onEdit: () => void;
}

export function MemberProfileDialog({ isOpen, onClose, member, onEdit }: MemberProfileDialogProps) {
    const { teams, currentTeamId } = useAppStore();
    const currentTeam = teams.find(t => t.id === currentTeamId);

    // Get full role objects
    const memberRoles = (member.roles || []).map(roleName =>
        currentTeam?.roles.find(r => r.name === roleName)
    ).filter(Boolean);

    // Get upcoming assignments from plans
    const upcomingPlans = (currentTeam?.plans || [])
        .filter(plan =>
            new Date(plan.date) >= new Date() &&
            plan.team?.some(t => t.memberId === member.id)
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Member Profile</SheetTitle>
                </SheetHeader>

                <div className="mt-4 space-y-6">
                    {/* Header Profile Info */}
                    <div className="flex flex-col items-center justify-center text-center space-y-3 pb-6 border-b border-border">
                        <div className="relative">
                            <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/10 shadow-lg"
                            />
                            <button
                                onClick={onEdit}
                                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90 transition-colors"
                                title="Edit Profile"
                            >
                                <PenSquare className="w-4 h-4" />
                            </button>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{member.name}</h2>
                            <p className="text-muted-foreground">Joined {format(new Date(), 'MMMM yyyy')}</p> {/* Mock joined date */}
                        </div>

                        <div className="flex flex-wrap justify-center gap-2">
                            {memberRoles.map((role, i) => {
                                if (!role) return null;
                                const Icon = (Icons as any)[role.icon] || Icons.User;
                                return (
                                    <span key={i} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${role.color} bg-opacity-10 text-foreground border border-border/50`}>
                                        <Icon className="w-3 h-3" />
                                        {role.name}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contact Info (Mocked if missing) */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Contact</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                                <Mail className="w-4 h-4 text-primary" />
                                <span className="text-sm">{member.name.toLowerCase().replace(' ', '.')}@example.com</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                                <Phone className="w-4 h-4 text-primary" />
                                <span className="text-sm">+1 (555) 123-4567</span>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Assignments */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Upcoming Assignments</h3>
                        {upcomingPlans.length > 0 ? (
                            <div className="space-y-2">
                                {upcomingPlans.map(plan => {
                                    const assignment = plan.team?.find(t => t.memberId === member.id);
                                    return (
                                        <div key={plan.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/50">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{plan.title}</span>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(new Date(plan.date), 'MMM d, h:mm a')}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-md">
                                                {assignment?.role || 'Member'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-muted-foreground text-sm bg-secondary/10 rounded-lg border border-dashed border-border">
                                No upcoming assignments
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-4 bg-secondary/20 rounded-xl text-center">
                            <div className="text-2xl font-bold text-primary">{upcomingPlans.length}</div>
                            <div className="text-xs text-muted-foreground">Upcoming</div>
                        </div>
                        <div className="p-4 bg-secondary/20 rounded-xl text-center">
                            <div className="text-2xl font-bold text-emerald-500">98%</div>
                            <div className="text-xs text-muted-foreground">Attendance</div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
