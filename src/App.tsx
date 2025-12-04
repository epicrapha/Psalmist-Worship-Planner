import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Library } from './pages/Library';
import { Plans } from './pages/Plans';
import { Teams } from './pages/Teams';
import { Settings } from './pages/Settings';
import { Rehearsal } from './pages/Rehearsal';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="psalmist-theme">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<Library />} />
            <Route path="/events" element={<Plans />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="/rehearsal/:songId" element={<Rehearsal />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
