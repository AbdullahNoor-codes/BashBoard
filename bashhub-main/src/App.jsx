import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Tasks from './pages/Tasks';
import Objectives from './pages/Objectives';
import Reports from './pages/Reports';
import Login from './pages/Login';
import NotificationService from '@/utils/NotificationService';

// Utility function to check if the user is authenticated
const isAuthenticated = () => {
  // For demonstration purposes, we'll use localStorage to store an "authToken".
  return !!localStorage.getItem("isLoggedIn");
};

function App() {
  useEffect(() => {
    // Initialize notifications when app starts
    NotificationService.requestPermission();
    NotificationService.registerServiceWorker();
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* <Route
            path="/"
            element={isAuthenticated() ? <Tasks /> : <Navigate to="/login" />}
          /> */}
          <Route
            path="/"
            element={<Tasks />}
          />
          {/* <Route
            path="/sessions"
            element={isAuthenticated() ? <Objectives /> : <Navigate to="/login" />}
          /> */}
          <Route
            path="/sessions"
            element={<Objectives />}
          />
          {/* <Route
            path="/reports"
            element={isAuthenticated() ? <Reports /> : <Navigate to="/login" />}
          /> */}
          <Route
            path="/reports"
            element={<Reports />}
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
