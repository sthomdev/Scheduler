import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainView from './pages/MainView';
import DeviceInfoPage from './pages/DeviceInfoPage'; // Import the new page
//import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainView />} />
          {/* Add route for DeviceInfoPage */}
          <Route path="/device/:resourceId" element={<DeviceInfoPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
