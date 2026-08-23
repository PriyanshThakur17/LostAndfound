import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Items from './pages/Items';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import ItemDetails from './pages/ItemDetails';

/**
 * App — Main layout & routing structure matching the team architecture.
 */
const App = () => {
  return (
    <div className="app-container">
      <Navbar />

      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/items" element={<Items initialType="all" />} />
          <Route path="/lost-items" element={<Items initialType="lost" />} />
          <Route path="/found-items" element={<Items initialType="found" />} />
          <Route path="/report-lost" element={<ReportLost />} />
          <Route path="/report-found" element={<ReportFound />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="*" element={<Items initialType="all" />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
};

export default App;
