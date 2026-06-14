import React from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import MeetingList from './pages/MeetingList';
import MeetingDetail from './pages/MeetingDetail';
import MemberList from './pages/MemberList';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <nav>
                <span className="brand">🏢 Meeting Logs</span>
                <NavLink to="/">📋 Danh sách họp</NavLink>
                <NavLink to="/members">👥 Thành viên</NavLink>
            </nav>

            <Routes>
                <Route path="/" element={<MeetingList />} />
                <Route path="/meetings/:id" element={<MeetingDetail />} />
                <Route path="/members" element={<MemberList />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;