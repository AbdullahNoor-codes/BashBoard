



// import React, { useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Layout from './components/layout/Layout';
// import Tasks from './pages/Tasks';
// import Objectives from './pages/Objectives';
// import Reports from './pages/Reports';
// import Login from './pages/Login';
// import NotificationService from '@/utils/NotificationService';

// const isAuthenticated = () => {
//   return localStorage.getItem("isLoggedIn");
// };

// function App() {
//   useEffect(() => {
//     NotificationService.requestPermission();
//     NotificationService.registerServiceWorker();
//   }, []);

//   return (
//     <Router>
//       <Layout>
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route
//             path="/"
//             element={isAuthenticated() ? <Tasks /> : <Navigate to="/login" />}
//           />
//           <Route
//             path="/sessions"
//             element={isAuthenticated() ? <Objectives /> : <Navigate to="/login" />}
//           />
//           <Route
//             path="/reports"
//             element={isAuthenticated() ? <Reports /> : <Navigate to="/login" />}
//           />
//         </Routes>
//       </Layout>
//     </Router>
//   );
// }

// export default App;




import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Tasks from './pages/Tasks';
import Objectives from './pages/Objectives';
import Reports from './pages/Reports';
import Login from './pages/Login';
import NotificationService from '@/utils/NotificationService';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isLoggedIn") === 'true';
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
};

function App() {
  useEffect(() => {
    NotificationService.requestPermission();
    NotificationService.registerServiceWorker();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/" element={
          <PrivateRoute>
            <Tasks />
          </PrivateRoute>
        } />
        <Route path="/sessions" element={
          <PrivateRoute>
            <Objectives />
          </PrivateRoute>
        } />
        <Route path="/reports" element={
          <PrivateRoute>
            <Reports />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

// Public route component to prevent authenticated users from accessing login
const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isLoggedIn") === 'true';
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

export default App;