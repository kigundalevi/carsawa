import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Listings } from './pages/Listings';
import { CarDetails } from './pages/CarDetails';
import { InventoryPage } from './components/inventory/inventory';
import { EditCarPage } from './components/edit-car/edit';
import { ListCarForm } from './components/list-car/listcar';
import { Profile } from './pages/Profile';
import { Transactions } from './pages/Transactions';
import { Bids } from './pages/Bids';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/car/:id" element={<CarDetails />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/list-car" element={<ListCarForm />} />
          <Route path="/edit-car/:id" element={<EditCarPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/bids" element={<Bids />} />
          <Route path="/transactions" element={<Transactions />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;