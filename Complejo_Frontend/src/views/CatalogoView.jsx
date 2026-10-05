import React, { useState } from 'react';
import { EspacioCard } from '../components/EspacioCard';
import './CatalogoView.css';

const mockEspacios = [
  {
    id: 1,
    nombre: 'Cedar Hollow Cabin',
    descripcion: 'Classic A-frame architecture with a wood-fired cedar barrel sauna and private trail head.',
    precioBase: 220,
    imagenes: ['https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800']
  },
  {
    id: 2,
    nombre: 'Grand Meadow Country House',
    descripcion: 'Expansive family retreat estate with 5 bedrooms, double stone hearth, and sunset terrace.',
    precioBase: 680,
    imagenes: ['https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800']
  },
  {
    id: 3,
    nombre: 'Rustic Timber Party Barn',
    descripcion: 'Historic hand-notched cedar barn equipped with ambient bistro festoon lighting.',
    precioBase: 450,
    imagenes: ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800']
  }
];

export const CatalogoView = ({ onAgregar, onNavegar }) => {
  const [filtro, setFiltro] = useState('ALL');

  return (
    <div className="catalogo-view">
      <main className="catalogo-main">
        <div className="catalogo-header">
          <h1>Woodland Dwellings & Gathering Spaces</h1>
          <p>Explora nuestras cabañas y salones disponibles en Whispering Pines.</p>
        </div>

        <div className="filtros-container">
          <button className={`filtro-btn ${filtro === 'ALL' ? 'active' : ''}`} onClick={() => setFiltro('ALL')}>Todos</button>
          <button className={`filtro-btn ${filtro === 'CABANA' ? 'active' : ''}`} onClick={() => setFiltro('CABANA')}>Cabañas</button>
        </div>

        <div className="grilla-espacios">
          {mockEspacios.map((espacio) => (
            <EspacioCard 
              key={espacio.id}
              espacio={espacio}
              onAgregar={() => onAgregar(espacio)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};
