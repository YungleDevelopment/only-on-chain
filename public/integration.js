;(() => {
  // Function to create a container for a widget
  function createWidgetContainer(id) {
    var container = document.createElement("div")
    container.id = id
    document.body.appendChild(container)
    return container
  }

  // Create containers for our widgets
  createWidgetContainer("next-widgets-root")

  // Load script with retry
  function loadScriptWithRetry(src, retries = 3) {
    return new Promise((resolve, reject) => {
      var script = document.createElement("script")
      script.src = src
      script.async = true
      script.crossOrigin = "anonymous" // Add CORS support
      script.onload = resolve
      script.onerror = (error) => {
        if (retries > 0) {
          console.log(`Retrying to load ${src}. ${retries} attempts left.`)
          loadScriptWithRetry(src, retries - 1)
            .then(resolve)
            .catch(reject)
        } else {
          reject(error)
        }
      }
      document.head.appendChild(script)
    })
  }

  // Load necessary scripts and initialize the widgets
  Promise.all([
    loadScriptWithRetry("https://unpkg.com/react@18/umd/react.production.min.js"),
    loadScriptWithRetry("https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"),
  ])
    .then(() => {
      // Load the widgets
      return loadScriptWithRetry("https://only-on-chain.vercel.app/widgets")
    })
    .then(() => {
      // Initialize the Next.js app
      var container = document.getElementById("next-widgets-root")
      var ReactDOM = window.ReactDOM
      var React = window.React
      var WidgetsPage = window.__NEXT_DATA__.props.pageProps.Component
      var root = ReactDOM.createRoot(container)
      root.hydrate(React.createElement(WidgetsPage))
    })
    .catch((error) => console.error("Error loading scripts:", error))

  // Load Next.js styles
  var link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = "https://only-on-chain.vercel.app/styles/globals.css"
  document.head.appendChild(link)
})()

