import React, { useState } from 'react';
import './AuthView.css'; // Compartiremos CSS para login y registro

export const LoginView = ({ onNavegar }) => {
  // CLASE 9: Único estado para múltiples inputs
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // CLASE 9: Función genérica con propiedad computada
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // CLASE 9: Prevenir la recarga por defecto
    console.log('Enviando datos de login:', formData);
    alert(`Bienvenido, ${formData.email}!`);
    onNavegar('catalogo'); // Simulamos un login exitoso
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Iniciar Sesión</h2>
        <p>Bienvenido de vuelta a Whispering Pines</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <button type="submit" className="button-accent auth-submit">Ingresar</button>
        </form>
        
        <p className="auth-footer">
          ¿No tienes una cuenta? <span onClick={() => onNavegar('register')} className="auth-link">Regístrate aquí</span>
        </p>
      </div>
    </div>
  );
};
