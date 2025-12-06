import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';

// Lazy load all page components
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Library = lazy(() => import('./pages/Library').then(m => ({ default: m.Library })));
const Plans = lazy(() => import('./pages/Plans').then(m => ({ default: m.Plans })));
const Teams = lazy(() => import('./pages/Teams').then(m => ({ default: m.Teams })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Rehearsal = lazy(() => import('./pages/Rehearsal').then(m => ({ default: m.Rehearsal })));

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="psalmist-theme">
      <BrowserRouter>
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/library" element={<Library />} />
              <Route path="/events" element={<Plans />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="/rehearsal/:songId" element={<Rehearsal />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
