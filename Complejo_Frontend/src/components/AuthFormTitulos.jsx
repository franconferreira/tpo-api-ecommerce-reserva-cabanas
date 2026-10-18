import React from 'react'

function AuthFormTitulos({ titlesClass, overlineClass, overline, title, description }) {
  return (
    <div className={titlesClass}>
      <span className={overlineClass}>{overline}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  )
}

export default AuthFormTitulos
