import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards.jsx';
import AppShell from './components/AppShell.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Today from './pages/Today.jsx';
import Board from './pages/Board.jsx';
import Explore from './pages/Explore.jsx';
import MapPage from './pages/MapPage.jsx';

// Rutas anidadas: todas las secciones comparten <AppShell> (navegación + panel + capas globales).
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/registro" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
          <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route path="/hoy" element={<Today />} />
            <Route path="/tablero" element={<Board />} />
            <Route path="/explorar" element={<Explore />} />
            <Route path="/mapa" element={<MapPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/hoy" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
