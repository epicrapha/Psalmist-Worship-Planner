import { useState } from 'react';
import { Search, SlidersHorizontal, Grid, List, ArrowUpDown } from 'lucide-react';
import { SongCard } from '../components/library/SongCard';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';
import { Card, CardContent } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';

type SortOption = 'title' | 'artist' | 'key' | 'bpm';

export function Library() {
    const navigate = useNavigate();
    const { songs, customTags } = useAppStore();
    const [activeTab, setActiveTab] = useState<'songs' | 'arrangements' | 'media'>('songs');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    // Sorting
    const [sortBy, setSortBy] = useState<SortOption>('title');
    const [sortAsc, setSortAsc] = useState(true);

    // Filter songs based on search and tags
    const filteredSongs = songs.filter(song => {
        const matchesSearch = searchQuery === '' ||
            song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.lyrics?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTags = selectedFilters.length === 0 ||
            selectedFilters.some(filter => song.tags.includes(filter) || song.key === filter);

        return matchesSearch && matchesTags;
    }).sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case 'title':
                comparison = a.title.localeCompare(b.title);
                break;
            case 'artist':
                comparison = a.artist.localeCompare(b.artist);
                break;
            case 'key':
                comparison = a.key.localeCompare(b.key);
                break;
            case 'bpm':
                comparison = a.bpm - b.bpm;
                break;
        }
        return sortAsc ? comparison : -comparison;
    });

    const toggleFilter = (filter: string) => {
        setSelectedFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
    };

    const handleSort = (option: SortOption) => {
        if (sortBy === option) {
            setSortAsc(!sortAsc);
        } else {
            setSortBy(option);
            setSortAsc(true);
        }
    };

    const allFilters = [...new Set([...customTags, 'Key of C', 'Key of G', 'Key of D', 'Key of A', 'Key of E'])];

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Library</h1>
                <div className="flex items-center gap-2">
                    <div className="flex bg-secondary rounded-lg p-1">
                        {['songs', 'arrangements', 'media'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={cn(
                                    "px-3 py-1 rounded-md text-xs font-medium capitalize transition-all",
                                    activeTab === tab
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md pb-4 pt-2 space-y-3">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search songs, artists, lyrics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-9 pr-4 rounded-xl bg-secondary/50 border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none text-sm"
                        />
                    </div>

                    <div className="flex bg-secondary rounded-lg p-0.5">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn("p-2 rounded-md transition-colors", showFilters ? "bg-background shadow-sm text-primary" : "text-muted-foreground")}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                        </button>
                        <div className="w-px bg-border my-1 mx-0.5" />
                        <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-md transition-colors", viewMode === 'list' ? "bg-background shadow-sm" : "text-muted-foreground")}>
                            <List className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-md transition-colors", viewMode === 'grid' ? "bg-background shadow-sm" : "text-muted-foreground")}>
                            <Grid className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Sort Options */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Sort by:</span>
                    {['title', 'artist', 'key', 'bpm'].map((option) => (
                        <button
                            key={option}
                            onClick={() => handleSort(option as SortOption)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 capitalize",
                                sortBy === option
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary hover:bg-secondary/80"
                            )}
                        >
                            {option}
                            {sortBy === option && (
                                <ArrowUpDown className={cn("w-3 h-3 transition-transform", !sortAsc && "rotate-180")} />
                            )}
                        </button>
                    ))}
                </div>

                {showFilters && (
                    <div className="flex flex-wrap gap-2 p-3 bg-secondary/30 rounded-xl border border-border animate-in slide-in-from-top-2">
                        <div className="w-full text-xs font-medium text-muted-foreground mb-1">Filters</div>
                        {allFilters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => toggleFilter(filter)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                                    selectedFilters.includes(filter) ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
                                )}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            {activeTab === 'songs' && (
                <div className={cn(viewMode === 'grid' ? "grid grid-cols-2 gap-4" : "space-y-3")}>
                    {filteredSongs.map((song) => (
                        viewMode === 'grid' ? (
                            <SongCard key={song.id} song={song} />
                        ) : (
                            <Card key={song.id} onClick={() => navigate(`/rehearsal/${song.id}`)} className="cursor-pointer hover:border-primary/50 transition-colors">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-primary">
                                        <span className="text-lg font-bold">{song.key}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold truncate">{song.title}</h3>
                                        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                                    </div>
                                    <div className="text-right text-xs text-muted-foreground">
                                        <div>{song.bpm} BPM</div>
                                        <div className="flex gap-1 mt-1 justify-end">
                                            {song.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    ))}
                </div>
            )}

            {activeTab === 'arrangements' && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>Arrangements coming soon</p>
                    <p className="text-sm mt-1">Create custom arrangements for your songs</p>
                </div>
            )}

            {activeTab === 'media' && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>Media library coming soon</p>
                    <p className="text-sm mt-1">Store and organize your media files</p>
                </div>
            )}

            {activeTab === 'songs' && filteredSongs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No songs found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
}
