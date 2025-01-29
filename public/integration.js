(() => {
  // Función para crear un contenedor para un widget
  function createWidgetContainer(id) {
    var container = document.createElement("div");
    container.id = id;
    document.body.appendChild(container);
    return container;
  }

  // Crear contenedores para nuestros widgets
  var walletContainer = createWidgetContainer("next-wallet-widget-container");
  var uploadContainer = createWidgetContainer("next-upload-widget-container");

  // Cargar el script de Next.js
  var script = document.createElement("script");
  script.src =
    "https://only-on-chain.vercel.app/_next/static/chunks/pages/widgets.js";
  script.onload = () => {
    // Inicializar la aplicación Next.js
    var ReactDOM = window.ReactDOM;
    var React = window.React;
    var Widgets = window.Widgets.default;

    ReactDOM.render(
      React.createElement(Widgets),
      document.getElementById("next-widgets-root")
    );
  };
  document.body.appendChild(script);

  // Cargar los estilos de Next.js
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://only-on-chain.vercel.app/_next/static/css/pages/widgets.css";
  document.head.appendChild(link);

  // Crear un contenedor raíz para los widgets de Next.js
  var root = document.createElement("div");
  root.id = "next-widgets-root";
  document.body.appendChild(root);
})();
