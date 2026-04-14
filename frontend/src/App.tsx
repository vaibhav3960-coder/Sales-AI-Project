import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './pages/DashboardLayout';
import EventTypes from './pages/EventTypes';
import Availability from './pages/Availability';
import Meetings from './pages/Meetings';
import BookingPage from './pages/BookingPage';
import LandingPage from './pages/LandingPage';
import ReschedulePage from './pages/ReschedulePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/book/:slug" element={<BookingPage />} />
        <Route path="/reschedule/:meetingId" element={<ReschedulePage />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/event-types" />} />
          <Route path="event-types" element={<EventTypes />} />
          <Route path="availability" element={<Availability />} />
          <Route path="meetings" element={<Meetings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
