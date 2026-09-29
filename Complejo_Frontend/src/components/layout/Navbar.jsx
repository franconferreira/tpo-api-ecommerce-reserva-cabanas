import React, { useState } from 'react';
import './Navbar.css';

export const Navbar = () => {
  // useState (Visto en Clase 8) para manejar el estado local del carrito o login mockeado
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="logo-icon">🌲</span>
        <h2>Whispering Pines</h2>
      </div>
      
      <div className="navbar-links">
        <a href="#catalogo">Catálogo</a>
        <a href="#mapa">Mapa</a>
        {isLoggedIn && <a href="#reservas">Mis Reservas</a>}
      </div>

      <div className="navbar-actions">
        <button className="button-accent" onClick={toggleLogin}>
          {isLoggedIn ? 'Cerrar Sesión' : 'Iniciar Sesión'}
        </button>
      </div>
    </nav>
  );
};
