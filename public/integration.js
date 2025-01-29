(() => {
  // Función para crear un contenedor para un widget
  function createWidgetContainer(id) {
    var container = document.createElement("div");
    container.id = id;
    document.body.appendChild(container);
    return container;
  }

  // Función para cargar un widget
  function loadWidget(widgetName, containerId) {
    var container = document.getElementById(containerId);
    if (!container) {
      container = createWidgetContainer(containerId);
    }

    fetch("https://only-on-chain.vercel.app/api/widgets?widget=" + widgetName)
      .then((response) => response.json())
      .then((data) => {
        container.innerHTML = data.content;
        // Ejecutar los scripts dentro del widget
        var scripts = container.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
          eval(scripts[i].innerText);
        }
      })
      .catch((error) => console.error("Error loading widget:", error));
  }

  // Cargar los widgets
  loadWidget("wallet", "next-wallet-widget-container");
  loadWidget("upload", "next-upload-widget-container");

  // Cargar los estilos de Next.js
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://only-on-chain.vercel.app/styles/widgets.css";
  document.head.appendChild(link);
})();
