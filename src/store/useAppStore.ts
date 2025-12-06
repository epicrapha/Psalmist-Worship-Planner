import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Song, ServicePlan, TeamMember, User, RoleDefinition, RoleGroup, Team } from '../types';

interface Notification {
    id: string;
    message: string;
    type: 'assignment' | 'update' | 'info';
    timestamp: string;
    read: boolean;
}

interface AppState {
    user: User | null;
    teams: Team[];
    currentTeamId: string | null;
    notifications: Notification[];

    // Global Actions
    setUser: (user: User | null) => void;
    addTeam: (team: Team) => void;
    updateTeam: (id: string, team: Partial<Team>) => void;
    deleteTeam: (id: string) => void;
    setCurrentTeam: (id: string) => void;

    // Team Scoped Actions (operate on currentTeamId)
    addSong: (song: Song) => void;
    updateSong: (id: string, song: Partial<Song>) => void;
    deleteSong: (id: string) => void;
    addPlan: (plan: ServicePlan) => void;
    updatePlan: (id: string, plan: Partial<ServicePlan>) => void;
    deletePlan: (id: string) => void;
    addTeamMember: (member: TeamMember) => void;
    updateTeamMember: (id: string, member: Partial<TeamMember>) => void;
    deleteTeamMember: (id: string) => void;
    addCustomRole: (role: RoleDefinition) => void;
    updateCustomRole: (id: string, role: Partial<RoleDefinition>) => void;
    deleteCustomRole: (id: string) => void;
    reorderRoles: (roles: RoleDefinition[]) => void;

    addRoleGroup: (group: RoleGroup) => void;
    updateRoleGroup: (id: string, group: Partial<RoleGroup>) => void;
    deleteRoleGroup: (id: string) => void;
    reorderRoleGroups: (groups: RoleGroup[]) => void;

    addCustomTag: (tag: string) => void;
    updateCustomTag: (oldTag: string, newTag: string) => void;
    addVenue: (venue: string) => void;

    // Notifications
    addNotification: (notification: Notification) => void;
    markNotificationRead: (id: string) => void;

    spotifyConnected: boolean;
    setSpotifyConnected: (connected: boolean) => void;
}

// Mock Data Migration
const DEFAULT_ROLES: RoleDefinition[] = [
    { id: 'admin', name: 'Admin', color: 'bg-red-500', icon: 'Shield', order: 0, permissions: ['all'] },
    { id: 'leader', name: 'Worship Leader', color: 'bg-orange-500', icon: 'Mic2', order: 1, permissions: ['manage_events', 'manage_library'] },
    { id: 'vocal', name: 'Vocalist', color: 'bg-pink-500', icon: 'Mic', order: 2, permissions: ['view_events'] },
    { id: 'guitar', name: 'Guitarist', color: 'bg-blue-500', icon: 'Guitar', order: 3, permissions: ['view_events'] },
    { id: 'keys', name: 'Keyboardist', color: 'bg-purple-500', icon: 'Piano', order: 4, permissions: ['view_events'] },
    { id: 'drums', name: 'Drummer', color: 'bg-yellow-500', icon: 'Drum', order: 5, permissions: ['view_events'] },
    { id: 'bass', name: 'Bassist', color: 'bg-indigo-500', icon: 'Music4', order: 6, permissions: ['view_events'] },
    { id: 'media', name: 'Media', color: 'bg-green-500', icon: 'Monitor', order: 7, permissions: ['manage_media'] },
];

const MOCK_SONGS: Song[] = [
    {
        id: '1',
        title: 'Way Maker',
        artist: 'Sinach',
        key: 'E',
        bpm: 68,
        tags: ['Contemporary', 'Worship'],
        lyrics: "You are here moving in our midst\nI worship You I worship You\nYou are here working in this place\nI worship You I worship You\n\n[Chorus]\nWay Maker Miracle Worker Promise Keeper\nLight in the darkness my God that is who You are",
        chords: "E B C#m A",
        youtubeLink: "https://youtu.be/iJCV_2H9xD0"
    },
    {
        id: '2',
        title: '10,000 Reasons',
        artist: 'Matt Redman',
        key: 'G',
        bpm: 72,
        tags: ['Hymn', 'Contemporary'],
        lyrics: "Bless the Lord O my soul O my soul\nWorship His Holy name\nSing like never before O my soul\nI'll worship Your Holy name",
        chords: "C G D Em C G D",
    },
    {
        id: '3',
        title: 'Goodness of God',
        artist: 'Bethel Music',
        key: 'Ab',
        bpm: 63,
        tags: ['Worship'],
        lyrics: "I love You Lord\nFor Your mercy never fails me\nAll my days\nI've been held in Your hands",
        chords: "Ab Db Eb Fm",
    },
    {
        id: '4',
        title: 'Build My Life',
        artist: 'Housefires',
        key: 'G',
        bpm: 68,
        tags: ['Worship'],
        lyrics: "Worthy of every song we could ever sing\nWorthy of all the praise we could ever bring\nWorthy of every breath we could ever breathe\nWe live for You",
        chords: "G C Em D",
    },
    {
        id: '5',
        title: 'Great Are You Lord',
        artist: 'All Sons & Daughters',
        key: 'A',
        bpm: 72,
        tags: ['Worship'],
        lyrics: "You give life You are love\nYou bring light to the darkness\nYou give hope You restore every heart that is broken\nAnd great are You Lord",
        chords: "D F#m E",
    }
];

const MOCK_PLANS: ServicePlan[] = [
    {
        id: '1',
        date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
        title: 'Sunday Service',
        leaderId: 'u1',
        items: [
            { id: 'p1', type: 'song', itemId: '1', title: 'Way Maker', duration: 300 },
            { id: 'p2', type: 'reading', title: 'Call to Worship', duration: 120 },
            { id: 'p3', type: 'song', itemId: '2', title: '10,000 Reasons', duration: 240 },
            { id: 'p4', type: 'media', title: 'Announcements Video', duration: 180 },
            { id: 'p5', type: 'song', itemId: '4', title: 'Build My Life', duration: 360 },
        ],
        team: [
            { memberId: 'u1', role: 'Worship Leader' },
            { memberId: 'u2', role: 'Vocalist' },
            { memberId: 'u3', role: 'Guitarist' },
            { memberId: 'u4', role: 'Drummer' }
        ]
    }
];

const MOCK_TEAM_MEMBERS: TeamMember[] = [
    { id: 'u1', name: 'Raphael', avatar: 'https://i.pravatar.cc/150?u=u1', roles: ['Admin', 'Worship Leader'], availability: {} },
    { id: 'u2', name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=u2', roles: ['Worship Leader', 'Vocalist'], availability: {} },
    { id: 'u3', name: 'John', avatar: 'https://i.pravatar.cc/150?u=u3', roles: ['Guitarist'], availability: {} },
    { id: 'u4', name: 'Emily', avatar: 'https://i.pravatar.cc/150?u=u4', roles: ['Drummer'], availability: {} },
];

const DEFAULT_TEAM: Team = {
    id: 't1',
    name: 'Worship Team',
    icon: 'Music',
    color: 'bg-primary',
    members: MOCK_TEAM_MEMBERS,
    roles: DEFAULT_ROLES,
    roleGroups: [],
    admins: ['u1'],
    plans: MOCK_PLANS,
    songs: MOCK_SONGS,
    venues: ['Main Sanctuary', 'Chapel', 'Youth Hall', 'Outdoor Pavilion'],
    customTags: ['Worship', 'Contemporary', 'Hymn', 'Fast', 'Slow', 'Intimate', 'Praise', 'Gospel'],
};

export const useAppStore = create<AppState>()(persist((set) => ({
    user: MOCK_TEAM_MEMBERS[0],
    teams: [DEFAULT_TEAM],
    currentTeamId: 't1',
    notifications: [
        { id: 'n1', message: 'Admin assigned you as Worship Leader for Sunday Service', type: 'assignment', timestamp: new Date().toISOString(), read: false },
        { id: 'n2', message: 'Sarah added "Way Maker" to the song library', type: 'update', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false },
    ],

    setUser: (user) => set({ user }),

    addTeam: (team) => set((state) => ({ teams: [...state.teams, team] })),
    updateTeam: (id, team) => set((state) => ({
        teams: state.teams.map(t => t.id === id ? { ...t, ...team } : t)
    })),
    deleteTeam: (id) => set((state) => ({
        teams: state.teams.filter(t => t.id !== id),
        currentTeamId: state.currentTeamId === id ? (state.teams.find(t => t.id !== id)?.id || null) : state.currentTeamId
    })),
    setCurrentTeam: (id) => set({ currentTeamId: id }),

    // Helper to update current team
    addSong: (song) => set((state) => ({
        teams: state.teams.map(t => t.id === state.currentTeamId ? { ...t, songs: [...t.songs, song] } : t)
    })),
    updateSong: (id, song) => set((state) => ({
        teams: state.teams.map(t => t.id === state.currentTeamId ? {
            ...t,
            songs: t.songs.map(s => s.id === id ? { ...s, ...song } : s)
        } : t)
    })),
    deleteSong: (id) => set((state) => ({
        teams: state.teams.map(t => t.id === state.currentTeamId ? {
            ...t,
            songs: t.songs.filter(s => s.id !== id)
        } : t)
    })),

    addPlan: (plan) => set((state) => ({
        teams: state.teams.map(t => t.id === state.currentTeamId ? { ...t, plans: [...t.plans, plan] } : t)
    })),
    updatePlan: (id, plan) => set((state) => ({
        teams: state.teams.map(t => t.id === state.currentTeamId ? {
            ...t,
            plans: t.plans.map(p => p.id === id ? { ...p, ...plan } : p)
        } : t)
    })),
    deletePlan: (id) => set((state) => ({
        teams: state.teams.map(t => t.id === state.currentTeamId ? {
            ...t,
            plans: t.plans.filter(p => p.id !== id)
        } : t)
    })),

    addTeamMember: (member) => set((state) => ({
        teams: state.teams.map(t => t.id === state.currentTeamId ? { ...t, members: [...t.members, member] } : t)
    })),
    updateTeamMember: (id, member) => set((state) => ({
        teams: state.teams.map(t => t.id === state.currentTeamId ? {
            ...t,
            members: t.members.map(m => m.id === id ? { ...m, ...member } : m)
        } : t)
    })),
    deleteTeamMember: (id) => set((state) => ({
        teams: state.teams.map(t => t.id === state.currentTeamId ? {
            ...t,
            members: t.members.filter(m => m.id !== id)
        } : t)
    })),

    addCustomRole: (role) => set((state) => ({
        teams: state.teams.map(t => t.id === state.currentTeamId ? { ...t, roles: [...t.roles, role] } : t)
    })),
    updateCustomRole: (id, role) => set((state) => ({
        teams: state.teams.map(t => t.id === state.currentTeamId ? {
            ...t,
            roles: t.roles.map(r => r.id === id ? { ...r, ...role } : r)
        } : t)
    })),
    deleteCustomRole: (id) => set((state) => ({
        teams: state.teams.map(t => t.id === state.currentTeamId ? {
            ...t,
            roles: t.roles.filter(r => r.id !== id)
        } : t)
    })),
    reorderRoles: (roles) => set((state) => ({
        teams: state.teams.map(t => t.id === state.currentTeamId ? { ...t, roles } : t)
    })),

    addRoleGroup: (group) => set((state) => ({
        teams: state.teams.map(t => t.id === state.currentTeamId ? { ...t, roleGroups: [...t.roleGroups, group] } : t)
    })),
    updateRoleGroup: (id, group) => set((state) => ({
        teams: state.teams.map(t => t.id === state.currentTeamId ? {
            ...t,
            roleGroups: t.roleGroups.map(g => g.id === id ? { ...g, ...group } : g)
        } : t)
    })),
    deleteRoleGroup: (id) => set((state) => ({
        teams: state.teams.map(t => t.id === state.currentTeamId ? {
            ...t,
            roleGroups: t.roleGroups.filter(g => g.id !== id),
            roles: t.roles.map(r => r.groupId === id ? { ...r, groupId: undefined } : r) // Remove group from roles
        } : t)
    })),
    reorderRoleGroups: (groups) => set((state) => ({
        teams: state.teams.map(t => t.id === state.currentTeamId ? { ...t, roleGroups: groups } : t)
    })),

    addCustomTag: (tag) => set((state) => ({
        teams: state.teams.map(t => t.id === state.currentTeamId ? {
            ...t,
            customTags: t.customTags.includes(tag) ? t.customTags : [...t.customTags, tag]
        } : t)
    })),
    updateCustomTag: (oldTag, newTag) => set((state) => ({
        teams: state.teams.map(t => t.id === state.currentTeamId ? {
            ...t,
            customTags: t.customTags.map(tag => tag === oldTag ? newTag : tag)
        } : t)
    })),

    addVenue: (venue) => set((state) => ({
        teams: state.teams.map(t => t.id === state.currentTeamId ? {
            ...t,
            venues: t.venues.includes(venue) ? t.venues : [...t.venues, venue]
        } : t)
    })),

    addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications]
    })),
    markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    })),

    spotifyConnected: false,
    setSpotifyConnected: (connected) => set({ spotifyConnected: connected }),
}), {
    name: 'psalmist-storage',
}));
