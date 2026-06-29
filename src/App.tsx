import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { isAuthenticated } from './lib/auth';
import Login from './pages/Login';
import Layout from './components/Layout';
import Home from './pages/Home';
import Anniversaries from './pages/Anniversaries';
import Diary from './pages/Diary';
import Missions from './pages/Missions';
import Photos from './pages/Photos';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Login />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="anniversaries" element={<Anniversaries />} />
          <Route path="diary" element={<Diary />} />
          <Route path="missions" element={<Missions />} />
          <Route path="photos" element={<Photos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
