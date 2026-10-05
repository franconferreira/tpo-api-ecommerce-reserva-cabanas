import React, { useState } from 'react';
import './AuthView.css'; 

export const RegisterView = ({ onNavegar }) => {
  // CLASE 9: Único estado para múltiples inputs
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // CLASE 9
    console.log('Enviando datos de registro:', formData);
    alert('Cuenta creada con éxito!');
    onNavegar('login'); 
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Crear Cuenta</h2>
        <p>Únete a la comunidad de Whispering Pines</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="nombre">Nombre</label>
              <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label htmlFor="apellido">Apellido</label>
              <input type="text" id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label htmlFor="telefono">Teléfono</label>
            <input type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} required />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          
          <button type="submit" className="button-accent auth-submit">Registrarse</button>
        </form>
        
        <p className="auth-footer">
          ¿Ya tienes cuenta? <span onClick={() => onNavegar('login')} className="auth-link">Inicia sesión</span>
        </p>
      </div>
    </div>
  );
};