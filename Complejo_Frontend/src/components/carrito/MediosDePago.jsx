import React, { useState } from 'react'
import textos from '../../i18n/textos'
import './MediosDePago.css'

function MediosDePago({
  idioma,
  total,
  medioPago,
  setMedioPago,
  datosPago,
  actualizarDato
}) {
  const t = textos[idioma].checkout.mediosPago
  const [copiadoCampo, setCopiadoCampo] = useState(null)

  const detectarMarca = (numero) => {
    const limpio = (numero || '').replace(/\s+/g, '')
    if (limpio.startsWith('4')) return 'VISA'
    if (/^5[1-5]/.test(limpio) || limpio.startsWith('5')) return 'MASTERCARD'
    if (/^3[47]/.test(limpio) || limpio.startsWith('3')) return 'AMEX'
    return 'CARD'
  }

  const handleNumeroTarjetaChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 16)
    const partes = digits.match(/.{1,4}/g)
    const formateado = partes ? partes.join(' ') : digits
    actualizarDato('numeroTarjeta', formateado)
  }

  const handleVencimientoChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
    let formateado = digits
    if (digits.length > 2) {
      formateado = `${digits.slice(0, 2)}/${digits.slice(2)}`
    }
    actualizarDato('vencimiento', formateado)
  }

  const handleCvvChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
    actualizarDato('cvv', digits)
  }

  const handleCopiar = (campo, valor) => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(valor)
        .then(() => {
          setCopiadoCampo(campo)
          setTimeout(() => setCopiadoCampo(null), 2000)
        })
        .catch(() => {
          setCopiadoCampo(campo)
          setTimeout(() => setCopiadoCampo(null), 2000)
        })
    }
  }

  const cuota3Monto = (total / 3).toFixed(2)
  const cuota6Monto = (total / 6).toFixed(2)
  const marcaTarjeta = detectarMarca(datosPago.numeroTarjeta)

  return (
    <div className="medios-pago-container">
      <div className="medios-pago-header">
        <h2 className="medios-pago-title">{t.titulo}</h2>
        <p className="medios-pago-subtitle">{t.subtitulo}</p>
      </div>

      <div className="medios-pago-tabs">
        <button
          type="button"
          className={`medios-pago-tab ${medioPago === 'tarjeta' ? 'active' : ''}`}
          onClick={() => setMedioPago('tarjeta')}
        >
          {t.tarjeta}
        </button>
        <button
          type="button"
          className={`medios-pago-tab ${medioPago === 'billetera' ? 'active' : ''}`}
          onClick={() => setMedioPago('billetera')}
        >
          {t.billetera}
        </button>
        <button
          type="button"
          className={`medios-pago-tab ${medioPago === 'transferencia' ? 'active' : ''}`}
          onClick={() => setMedioPago('transferencia')}
        >
          {t.transferencia}
        </button>
        <button
          type="button"
          className={`medios-pago-tab ${medioPago === 'recepcion' ? 'active' : ''}`}
          onClick={() => setMedioPago('recepcion')}
        >
          {t.recepcion}
        </button>
      </div>

      <div className="medios-pago-content">
        {/* PANEL TARJETA */}
        {medioPago === 'tarjeta' && (
          <div className="tarjeta-layout">
            <div className="tarjeta-preview-col">
              <div className="tarjeta-mockup">
                <div className="tarjeta-header-display">
                  <div className="tarjeta-chip" title={t.tarjetaChip}></div>
                  <span className="tarjeta-marca">{marcaTarjeta}</span>
                </div>

                <div className="tarjeta-numero-display">
                  {datosPago.numeroTarjeta || '•••• •••• •••• ••••'}
                </div>

                <div className="tarjeta-footer-display">
                  <div>
                    <span className="tarjeta-campo-label">{t.tarjetaTitular}</span>
                    <span className="tarjeta-campo-valor">
                      {datosPago.nombreTitular || t.tarjetaTitularPlaceholder}
                    </span>
                  </div>
                  <div>
                    <span className="tarjeta-campo-label">{t.tarjetaVencimiento}</span>
                    <span className="tarjeta-campo-valor">
                      {datosPago.vencimiento || 'MM/AA'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="tarjeta-form-col">
              <div className="pago-input-group">
                <label htmlFor="pago-numero-tarjeta">{t.tarjetaNumero}</label>
                <input
                  id="pago-numero-tarjeta"
                  type="text"
                  className="pago-input"
                  placeholder="4500 0000 0000 0000"
                  value={datosPago.numeroTarjeta}
                  onChange={handleNumeroTarjetaChange}
                  maxLength="19"
                />
              </div>

              <div className="pago-input-group">
                <label htmlFor="pago-nombre-titular">{t.tarjetaTitular}</label>
                <input
                  id="pago-nombre-titular"
                  type="text"
                  className="pago-input"
                  placeholder={t.tarjetaTitularPlaceholder}
                  value={datosPago.nombreTitular}
                  onChange={(e) => actualizarDato('nombreTitular', e.target.value.toUpperCase())}
                />
              </div>

              <div className="pago-row-grid">
                <div className="pago-input-group">
                  <label htmlFor="pago-vencimiento">{t.tarjetaVencimiento}</label>
                  <input
                    id="pago-vencimiento"
                    type="text"
                    className="pago-input"
                    placeholder="12/28"
                    value={datosPago.vencimiento}
                    onChange={handleVencimientoChange}
                    maxLength="5"
                  />
                </div>

                <div className="pago-input-group">
                  <label htmlFor="pago-cvv">{t.tarjetaCvv}</label>
                  <input
                    id="pago-cvv"
                    type="password"
                    className="pago-input"
                    placeholder="123"
                    value={datosPago.cvv}
                    onChange={handleCvvChange}
                    maxLength="4"
                  />
                </div>
              </div>

              <div className="pago-input-group">
                <label htmlFor="pago-cuotas">{t.tarjetaCuotas}</label>
                <select
                  id="pago-cuotas"
                  className="pago-input"
                  value={datosPago.cuotas}
                  onChange={(e) => actualizarDato('cuotas', e.target.value)}
                >
                  <option value="1">{t.cuota1(total)}</option>
                  <option value="3">{t.cuota3(cuota3Monto)}</option>
                  <option value="6">{t.cuota6(cuota6Monto)}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* PANEL BILLETERA DIGITAL */}
        {medioPago === 'billetera' && (
          <div className="billetera-box">
            <div>
              <h3 style={{ margin: '0 0 0.3em 0', fontSize: '1.05em', color: '#153c2b' }}>
                {t.billeteraTitulo}
              </h3>
              <p style={{ margin: 0, fontSize: '0.88em', color: '#666' }}>
                {t.billeteraTexto}
              </p>
            </div>

            <div className="billetera-selector-grupo">
              <button
                type="button"
                className={`billetera-opcion ${datosPago.billeteraTipo === 'mp' ? 'active' : ''}`}
                onClick={() => actualizarDato('billeteraTipo', 'mp')}
              >
                <span>🔵</span>
                <span>{t.mp}</span>
              </button>
              <button
                type="button"
                className={`billetera-opcion ${datosPago.billeteraTipo === 'paypal' ? 'active' : ''}`}
                onClick={() => actualizarDato('billeteraTipo', 'paypal')}
              >
                <span>🅿️</span>
                <span>{t.paypal}</span>
              </button>
            </div>

            <div className="billetera-status">
              <div>
                <span className="billetera-vinculada-badge">
                  {datosPago.cuentaVinculada ? t.vinculada : `${datosPago.billeteraTipo === 'mp' ? t.mp : t.paypal}`}
                </span>
                <span className="billetera-email-simulado">
                  {datosPago.cuentaVinculada
                    ? t.billeteraSimulada
                    : 'Haz clic en el botón para autorizar el débito seguro de tu estadía.'}
                </span>
              </div>
              {!datosPago.cuentaVinculada ? (
                <button
                  type="button"
                  className="btn-vincular-billetera"
                  onClick={() => actualizarDato('cuentaVinculada', true)}
                >
                  {t.vincular}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-vincular-billetera"
                  style={{ backgroundColor: '#2e7d32' }}
                  onClick={() => actualizarDato('cuentaVinculada', false)}
                >
                  Cambiar
                </button>
              )}
            </div>
          </div>
        )}

        {/* PANEL TRANSFERENCIA BANCARIA */}
        {medioPago === 'transferencia' && (
          <div className="transf-box">
            <div>
              <h3 style={{ margin: '0 0 0.3em 0', fontSize: '1.05em', color: '#153c2b' }}>
                {t.transfTitulo}
              </h3>
            </div>

            <div className="transf-datos-grid">
              <div className="transf-item">
                <span className="transf-item-label">{t.banco}</span>
                <span className="transf-item-valor">{t.bancoValor}</span>
              </div>

              <div className="transf-item">
                <span className="transf-item-label">{t.titular}</span>
                <span className="transf-item-valor">{t.titularValor}</span>
              </div>

              <div className="transf-item">
                <span className="transf-item-label">{t.cbu}</span>
                <div className="transf-item-valor-wrapper">
                  <span className="transf-item-valor">0720123988000045678901</span>
                  <button
                    type="button"
                    className={`btn-copiar-dato ${copiadoCampo === 'cbu' ? 'copiado' : ''}`}
                    onClick={() => handleCopiar('cbu', '0720123988000045678901')}
                  >
                    {copiadoCampo === 'cbu' ? t.copiado : t.copiar}
                  </button>
                </div>
              </div>

              <div className="transf-item">
                <span className="transf-item-label">{t.alias}</span>
                <div className="transf-item-valor-wrapper">
                  <span className="transf-item-valor">WHISPERING.PINES.USD</span>
                  <button
                    type="button"
                    className={`btn-copiar-dato ${copiadoCampo === 'alias' ? 'copiado' : ''}`}
                    onClick={() => handleCopiar('alias', 'WHISPERING.PINES.USD')}
                  >
                    {copiadoCampo === 'alias' ? t.copiado : t.copiar}
                  </button>
                </div>
              </div>
            </div>

            <div className="pago-input-group">
              <label htmlFor="pago-comprobante">{t.comprobanteLabel}</label>
              <input
                id="pago-comprobante"
                type="text"
                className="pago-input"
                placeholder={t.comprobantePlaceholder}
                value={datosPago.comprobante}
                onChange={(e) => actualizarDato('comprobante', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* PANEL RECEPCIÓN */}
        {medioPago === 'recepcion' && (
          <div className="recepcion-box">
            <div>
              <h3 style={{ margin: '0 0 0.3em 0', fontSize: '1.05em', color: '#153c2b' }}>
                {t.recepcionTitulo}
              </h3>
            </div>

            <div className="recepcion-alerta">
              <span className="recepcion-icono">🛎️</span>
              <div>{t.recepcionTexto}</div>
            </div>

            <label className="recepcion-checkbox-label">
              <input
                type="checkbox"
                checked={datosPago.aceptaRecepcion}
                onChange={(e) => actualizarDato('aceptaRecepcion', e.target.checked)}
              />
              <span>{t.recepcionCheck}</span>
            </label>
          </div>
        )}
      </div>
    </div>
  )
}

export default MediosDePago
