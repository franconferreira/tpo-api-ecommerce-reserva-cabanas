import React, { useState } from 'react';
import './Navbar.css';

export const Navbar = ({ onNavegar }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => onNavegar('catalogo')} style={{cursor: 'pointer'}}>
        <span className="logo-icon">🌲</span>
        <h2>Whispering Pines</h2>
      </div>
      
      <div className="navbar-links">
        <button className="nav-btn" onClick={() => onNavegar('catalogo')}>Catálogo</button>
      </div>

      <div className="navbar-actions">
        {!isLoggedIn ? (
          <>
            <button className="button-accent" onClick={() => onNavegar('login')}>Iniciar Sesión</button>
            <button className="button-outline" onClick={() => onNavegar('register')} style={{marginLeft: '10px'}}>Registrarse</button>
          </>
        ) : (
          <button className="button-accent" onClick={() => setIsLoggedIn(false)}>Cerrar Sesión</button>
        )}
      </div>
    </nav>
  );
};
