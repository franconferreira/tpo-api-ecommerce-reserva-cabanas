import React from 'react';
import './EspacioCard.css';

// Componente Funcional Chiquito (Clase 8)
// Recibe 'props' (desestructuradas como vimos en Clase 7)
export const EspacioCard = ({ nombre, precioBase, descripcion, imagenUrl, capacidad, descuento }) => {
  return (
    <div className="espacio-card">
      <div className="card-image-container">
        <img src={imagenUrl} alt={nombre} className="card-image" />
        {descuento > 0 && <span className="card-badge-descuento">-{descuento}% OFF</span>}
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{nombre}</h3>
        <p className="card-desc">{descripcion}</p>
        
        <div className="card-footer">
          <div className="price-container">
            <span className="price">${precioBase}</span>
            <span className="price-night">/ night</span>
          </div>
          <button className="button-primary">Ver Disponibilidad</button>
        </div>
      </div>
    </div>
  );
};
