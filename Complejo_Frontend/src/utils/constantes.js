export const IMAGEN_POR_DEFECTO =
  'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800'

export const CARRITO_VACIO = {
  id: null,
  totalSinDescuento: 0,
  descuentoPackPorcentaje: 0,
  total: 0,
  items: []
}

// Devuelve la primera imagen válida de un espacio o la imagen por defecto
export const imagenPrincipal = (imagenes) =>
  imagenes && imagenes.length > 0 && imagenes[0] && imagenes[0].trim() !== ''
    ? imagenes[0]
    : IMAGEN_POR_DEFECTO
