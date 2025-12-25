import { Route, Routes } from 'react-router';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { MapPage } from './pages/MapPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="map" element={<MapPage />} />
      </Route>
    </Routes>
  );
}

export default App;
