;(() => {
  // Función para crear un contenedor para un widget
  function createWidgetContainer(id) {
    var container = document.createElement("div")
    container.id = id
    document.body.appendChild(container)
    return container
  }

  // Crear contenedores para nuestros widgets
  createWidgetContainer("next-wallet-widget-container")
  createWidgetContainer("next-upload-widget-container")

  // Cargar React y ReactDOM
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      var script = document.createElement("script")
      script.src = src
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  Promise.all([
    loadScript("https://unpkg.com/react@18/umd/react.production.min.js"),
    loadScript("https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"),
    loadScript("https://only-on-chain.vercel.app/widgets"),
  ])
    .then(() => {
      // Inicializar la aplicación Next.js
      var container = document.createElement("div")
      container.id = "next-widgets-root"
      document.body.appendChild(container)

      var WidgetsPage = window.__NEXT_DATA__.props.pageProps.Component
      // ReactDOM was undeclared.  Assuming it's available after loading the script.
      const root = ReactDOM.createRoot(container)
      root.render(React.createElement(WidgetsPage))
    })
    .catch((error) => console.error("Error loading scripts:", error))

  // Cargar los estilos de Next.js
  var link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = "https://only-on-chain.vercel.app/styles/globals.css"
  document.head.appendChild(link)
})()

