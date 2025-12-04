import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function Layout() {
    return (
        <div className="min-h-screen bg-background font-sans antialiased pb-20 transition-colors duration-300">
            <main className="container mx-auto px-4 py-6 max-w-md md:max-w-2xl lg:max-w-4xl">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
}
