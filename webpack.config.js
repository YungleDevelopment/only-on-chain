const path = require("path");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const isDevelopment = process.env.NODE_ENV !== "production";
const webpack = require('webpack');

module.exports = {
  mode: isDevelopment ? "development" : "production",
  entry: "./src/index.tsx", // Cambia a .tsx si usarás JSX en TypeScript
  plugins: [
    isDevelopment && new ReactRefreshWebpackPlugin({
      overlay: false, // Deshabilita el overlay de errores para evitar recargas completas
    }),
    new webpack.DefinePlugin({
      'process.env.ENVIRONMENT': JSON.stringify(process.env.ENVIRONMENT),
    }),
    // Provide polyfills for Node.js core modules
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ].filter(Boolean),
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/, // Soporta archivos TypeScript y TSX
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/, // 🔥 Orden correcto para manejar CSS con PostCSS
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(pdf|jpg|png|gif|svg|ico)$/,
        use: [
          {
            loader: "url-loader",
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader: "file-loader",
      },
      {
        test: /\.wasm$/,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]'
        }
      },
    ],
  },
  resolve: {
    extensions: ["*", ".js", ".jsx", ".ts", ".tsx"], // Agrega soporte a TypeScript
    fallback: {
      "util": require.resolve("util/"),
      "path": require.resolve("path-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "fs": false,
      "os": require.resolve("os-browserify/browser"),
      "crypto": require.resolve("crypto-browserify"),
      "process": require.resolve("process/browser")
    }
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    filename: "bundle.js",
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    hot: true, // 🔥 Habilita Hot Module Replacement (HMR)
    liveReload: true, // 🚫 Deshabilita liveReload para evitar recargas completas
    watchFiles: ["src/**/*"], // 👀 Observa cambios en los archivos dentro de "src"
    historyApiFallback: true, // 📌 Corrige problemas de rutas en React
    open: true, // 🚀 Abre el navegador automáticamente
    port: 3000, // 🌐 Puerto
    client: {
      overlay: false, // 🚫 Deshabilita el overlay de errores para evitar recargas completas
      progress: true, // ✅ Muestra el progreso de compilación
    },
  },
  devtool: isDevelopment ? 'eval-source-map' : false, // Mejor opción para desarrollo
};
