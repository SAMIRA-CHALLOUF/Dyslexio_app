import React from 'react';
import { Navigate } from 'react-router-dom';
import { ElevesProvider } from '../../store/elevesStore';

export default function DashboardRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  if (!token || !user || user.typeCompte !== 'etablissement') {
    return <Navigate to="/signin" replace />;
  }

  return <ElevesProvider>{children}</ElevesProvider>;
}
