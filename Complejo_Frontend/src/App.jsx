import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { CatalogoView } from './views/CatalogoView';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';

function App() {
  // Estado para simular la navegación (Sin React Router)
  const [vistaActual, setVistaActual] = useState('catalogo');
  
  // Estado global simple (por ahora no se usa en la vista, pero demuestra la idea de carrito)
  const [carrito, setCarrito] = useState([]);

  const agregarAlCarrito = (espacio) => {
    setCarrito([...carrito, espacio]);
    alert(`${espacio.nombre} agregado al carrito.`);
  };

  return (
    <>
      {/* Levantamiento de estado: le pasamos la función a la Navbar para que cambie la vista superior */}
      <Navbar onNavegar={setVistaActual} />
      
      {/* Renderizado Condicional de las Vistas según el estado */}
      {vistaActual === 'catalogo' && (
        <CatalogoView onAgregar={agregarAlCarrito} onNavegar={setVistaActual} />
      )}
      
      {vistaActual === 'login' && (
        <LoginView onNavegar={setVistaActual} />
      )}
      
      {vistaActual === 'register' && (
        <RegisterView onNavegar={setVistaActual} />
      )}
    </>
  );
}

export default App;
