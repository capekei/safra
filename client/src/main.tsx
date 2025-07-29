import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import "./index.css";

console.log('🚀 SafraReport main.tsx: Starting React application');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ SafraReport: Root element not found');
  throw new Error('Root element not found');
}

console.log('✅ SafraReport: Root element found, creating React root');

try {
  const root = createRoot(rootElement);
  console.log('✅ SafraReport: React root created, rendering App');
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  console.log('✅ SafraReport: App rendered successfully');
} catch (error) {
  console.error('❌ SafraReport: Error during React rendering:', error);
  rootElement.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f9fafb; font-family: system-ui;">
      <div style="text-align: center; max-width: 400px; padding: 2rem; background: white; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #dc2626; margin-bottom: 1rem;">Error al cargar SafraReport</h2>
        <p style="color: #6b7280; margin-bottom: 1rem;">Ha ocurrido un error al inicializar la aplicación. Por favor, recarga la página.</p>
        <button onclick="window.location.reload()" style="background: #10b981; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.25rem; cursor: pointer;">
          Recargar página
        </button>
        <details style="margin-top: 1rem; text-align: left;">
          <summary style="cursor: pointer; color: #6b7280;">Detalles del error</summary>
          <pre style="background: #fef2f2; color: #dc2626; padding: 1rem; border-radius: 0.25rem; font-size: 0.75rem; overflow: auto; margin-top: 0.5rem;">${error}</pre>
        </details>
      </div>
    </div>
  `;
}
