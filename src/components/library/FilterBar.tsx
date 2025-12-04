import { Search, SlidersHorizontal } from 'lucide-react';

export function FilterBar() {
    return (
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md pb-4 pt-2 space-y-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search songs, artists, lyrics..."
                    className="w-full h-10 pl-9 pr-4 rounded-xl bg-secondary/50 border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none text-sm"
                />
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide pb-1">
                <button className="p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
                    <SlidersHorizontal className="w-4 h-4" />
                </button>
                {['Fast', 'Slow', 'Hymn', 'Contemporary', 'Key of G'].map((filter) => (
                    <button
                        key={filter}
                        className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 whitespace-nowrap transition-colors"
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div>
    );
}
