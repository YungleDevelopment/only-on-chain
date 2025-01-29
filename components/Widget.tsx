import type React from "react"

const Widget: React.FC = () => {
  return (
    <div className="widget-container">
      <div className="widget-content">
        <h2>Mi Widget</h2>
        <p>Este es el contenido de mi widget</p>
      </div>
      <div className="widget-fixed-element" style={{ position: "fixed", bottom: "20px", right: "20px" }}>
        <button>Botón Fijo</button>
      </div>
    </div>
  )
}

export default Widget

