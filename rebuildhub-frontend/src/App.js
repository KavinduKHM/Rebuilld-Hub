import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ResourceProvider } from './context/ResourceContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ResourceProvider>
          <AppRoutes />
        </ResourceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;