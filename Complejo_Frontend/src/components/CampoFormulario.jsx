import React from 'react'

function CampoFormulario({ className, label, type, name, placeholder, value, onChange }) {
  return (
    <div className={className}>
      <label>{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default CampoFormulario
