import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AdminUsuarioRow from './AdminUsuarioRow'
import PageHeader from '../../layout/PageHeader'
import textos from '../../../i18n/textos'
import { fetchUsuarios, cambiarEstadoUsuario, cambiarRolUsuario } from '../../../Redux/adminUsuariosSlice'
import './AdminUsuarios.css'

function AdminUsuarios({ idioma }) {
  const dispatch = useDispatch()
  const { items: usuarios, error: errorSlice } = useSelector((state) => state.adminUsuarios)
  const t = textos[idioma].adminUsuarios

  useEffect(() => {
    dispatch(fetchUsuarios())
  }, [dispatch])

  const handleToggleEstado = (usuario) => {
    dispatch(cambiarEstadoUsuario(usuario))
  }

  const handleToggleRol = (usuario) => {
    dispatch(cambiarRolUsuario(usuario))
  }

  let error = ''
  if (errorSlice === 'estado') error = t.errorEstado
  if (errorSlice === 'rol') error = t.errorRol

  return (
    <>
      <PageHeader overline={t.overline} titulo={t.titulo} subtitulo={t.subtitulo}>
        <div className="kpi-pill">
          <strong>TOTAL</strong> {usuarios.length}
        </div>
      </PageHeader>

      {error && <p className="admin-usr-error">{error}</p>}

      <div className="admin-usr-table-container">
        <table className="admin-usr-table">
          <thead>
            <tr>
              <th>{t.colPerfil}</th>
              <th>{t.colContacto}</th>
              <th>{t.colRol}</th>
              <th>{t.colEstado}</th>
              <th>{t.colAcciones}</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <AdminUsuarioRow
                idioma={idioma}
                usuario={usuario}
                onToggleRol={handleToggleRol}
                onToggleEstado={handleToggleEstado}
                key={usuario.id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default AdminUsuarios
