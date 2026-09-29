import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { CatalogoView } from './views/CatalogoView';
import { DetalleEspacioView } from './views/DetalleEspacioView';
import { CarritoView } from './views/CarritoView';
import { MisReservasView } from './views/MisReservasView';
import { PanelAdminView } from './views/PanelAdminView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/catalogo" replace />} />
        
        {/* Rutas Públicas */}
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />
        <Route path="/catalogo" element={<CatalogoView />} />
        <Route path="/catalogo/:id" element={<DetalleEspacioView />} />

        {/* Rutas Cliente (Idealmente protegidas) */}
        <Route path="/carrito" element={<CarritoView />} />
        <Route path="/mis-reservas" element={<MisReservasView />} />

        {/* Rutas Admin (Idealmente protegidas por rol) */}
        <Route path="/admin" element={<PanelAdminView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
