(() => {
  // Function to load CSS
  function loadStyles() {
    const links = ["https://only-on-chain.vercel.app/standalone/styles.css"];

    links.forEach((href) => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    });
  }

  // Function to create widget containers
  function createWidgetContainers() {
    // Create wallet container
    const walletContainer = document.createElement("div");
    walletContainer.id = "wallet-connector-container";
    walletContainer.style.position = "fixed";
    walletContainer.style.top = "20px";
    walletContainer.style.right = "20px";
    walletContainer.style.zIndex = "9999";
    document.body.appendChild(walletContainer);

    // Create upload container
    const uploadContainer = document.createElement("div");
    uploadContainer.id = "upload-widget-container";
    uploadContainer.style.position = "fixed";
    uploadContainer.style.bottom = "20px";
    uploadContainer.style.right = "20px";
    uploadContainer.style.zIndex = "9999";
    document.body.appendChild(uploadContainer);

    return { walletContainer, uploadContainer };
  }

  // Load script with retry
  function loadScriptWithRetry(src, retries = 3) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
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

  // Initialize widgets
  async function initializeWidgets() {
    try {
      // Load styles first
      loadStyles();

      // Create containers
      const { walletContainer, uploadContainer } = createWidgetContainers();

      // Load required scripts
      await Promise.all([
        loadScriptWithRetry(
          "https://unpkg.com/react@18/umd/react.production.min.js"
        ),
        loadScriptWithRetry(
          "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
        ),
        loadScriptWithRetry(
          "https://only-on-chain.vercel.app/standalone/page.js"
        ),
      ]);

      // Get our components and provider
      const { Widgets } = window;

      // Initialize React components
      const React = window.React;
      const ReactDOM = window.ReactDOM;

      // Render Wallet Connector
      ReactDOM.createRoot(walletContainer).render(
        React.createElement(
          Widgets.Provider,
          null,
          React.createElement(Widgets.WalletConnector)
        )
      );

      // Render Upload Widget
      ReactDOM.createRoot(uploadContainer).render(
        React.createElement(
          Widgets.Provider,
          null,
          React.createElement(Widgets.UploadWidget)
        )
      );
    } catch (error) {
      console.error("Error initializing widgets:", error);
    }
  }

  // Start initialization
  initializeWidgets();
})();
