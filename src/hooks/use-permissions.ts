import { useAppStore } from '../store/useAppStore';


export function usePermissions() {
    const { user, teams, currentTeamId } = useAppStore();
    const currentTeam = teams.find(t => t.id === currentTeamId);

    // If no team selected or no user, no permissions (unless system admin?)
    if (!currentTeam || !user) {
        return {
            can: () => false,
            isLeader: false,
            isAdmin: false,
        };
    }

    // Find current member record
    const member = currentTeam.members.find(m => m.id === user.id);
    if (!member) {
        return {
            can: () => false,
            isLeader: false,
            isAdmin: false,
        };
    }

    // Aggregate permissions from all roles
    const memberPermissions = new Set<string>();

    // Check if user is a Team Admin (special case if we have an 'admins' array on Team?)
    // In our store, we have `admins: ['u1']`.
    const isTeamAdmin = currentTeam.admins?.includes(user.id);
    if (isTeamAdmin) {
        memberPermissions.add('all');
    }

    (member.roles || []).forEach(roleName => {
        const roleDef = currentTeam.roles.find(r => r.name === roleName);
        if (roleDef) {
            if (roleDef.permissions.includes('all')) {
                memberPermissions.add('all');
            } else {
                roleDef.permissions.forEach(p => memberPermissions.add(p));
            }
        }
    });

    const can = (permissionId: string) => {
        if (memberPermissions.has('all')) return true;
        return memberPermissions.has(permissionId);
    };

    return {
        can,
        isLeader: can('manage_events') || can('manage_team'), // Shortcut helper
        isAdmin: memberPermissions.has('all'),
    };
}
