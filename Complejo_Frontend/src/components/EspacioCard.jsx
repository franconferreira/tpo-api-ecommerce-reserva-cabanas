import React from 'react';
import './EspacioCard.css';

export const EspacioCard = ({ espacio, onAgregar }) => {
  const { nombre, precioBase, descripcion, imagenes } = espacio;
  
  // Usamos la primera imagen del array si existe
  const imagenUrl = imagenes && imagenes.length > 0 ? imagenes[0] : 'https://via.placeholder.com/800x600?text=Sin+Imagen';

  return (
    <div className="espacio-card">
      <div className="card-image-container">
        <img src={imagenUrl} alt={nombre} className="card-image" />
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{nombre}</h3>
        <p className="card-desc">{descripcion}</p>
        
        <div className="card-footer">
          <div className="price-container">
            <span className="price">${precioBase}</span>
            <span className="price-night">/ night</span>
          </div>
          {/* Levantamiento de Estado: el hijo llama a la función del padre */}
          <button className="button-primary" onClick={onAgregar}>Agregar al Carrito</button>
        </div>
      </div>
    </div>
  );
};
