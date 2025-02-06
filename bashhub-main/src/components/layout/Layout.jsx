// import React from 'react';
// import Sidebar from './Sidebar';

// function Layout({ children }) {
//   return (
//     <div className="flex h-screen bg-gray-300">
//       <Sidebar />
//       <main className="flex-1 overflow-auto p-8">
//         {children}
//       </main>
//     </div>
//   );
// }

// export default Layout;

import React from 'react';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';

function Layout({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  

  if (!isLoggedIn && isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{backgroundColor: "#F3F4F6"}}>
      {isLoggedIn && <Sidebar />}
      {/* <Sidebar /> */}
      <main className={`flex-1 max-h-[100vh] overflow-auto p-4 lg:p-8 ${isLoggedIn ? 'pt-20 lg:pt-8' : ''}`}>
        {children}
        <Toaster />
      </main>
    </div>
  );
}

export default Layout;