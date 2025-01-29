(() => {
  // Function to create a container for a widget
  function createWidgetContainer(id) {
    var container = document.createElement("div");
    container.id = id;
    document.body.appendChild(container);
    return container;
  }

  // Create containers for our widgets
  const container = createWidgetContainer("next-widgets-root");

  // Load script with retry
  function loadScriptWithRetry(src, retries = 3) {
    return new Promise((resolve, reject) => {
      var script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = resolve;
      script.onerror = (error) => {
        if (retries > 0) {
          console.log(`Retrying to load ${src}. ${retries} attempts left.`);
          loadScriptWithRetry(src, retries - 1)
            .then(resolve)
            .catch(reject);
        } else {
          reject(error);
        }
      };
      document.head.appendChild(script);
    });
  }

  // Load styles first
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://only-on-chain.vercel.app/styles/globals.css";
  document.head.appendChild(link);

  // Load necessary scripts and initialize the widgets
  Promise.all([
    loadScriptWithRetry(
      "https://unpkg.com/react@18/umd/react.production.min.js"
    ),
    loadScriptWithRetry(
      "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
    ),
  ])
    .then(() => {
      // Create a simple React component wrapper
      const WidgetWrapper = () => {
        const [Component, setComponent] = React.useState(null);

        React.useEffect(() => {
          // Dynamically import the widget component
          import("https://only-on-chain.vercel.app/widgets")
            .then((module) => {
              setComponent(() => module.default);
            })
            .catch(console.error);
        }, []);

        if (!Component) return null;
        return React.createElement(Component);
      };

      // Render the widget
      const root = ReactDOM.createRoot(container);
      root.render(React.createElement(WidgetWrapper));
    })
    .catch((error) => console.error("Error loading scripts:", error));
})();
