import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './Components/App.tsx'
import './index.css'
import AppConfig from './Components/AppConfig.tsx'

const AppContainer = () => {
  const [windowType, setWindowType] = useState<string | null>(null);

  useEffect(() => {
    window.ipcRenderer.on('window-type', (_event, type) => {
      setWindowType(type);
      console.log(type)
    });
    
    // Cleanup listener on unmount
    return () => {
      window.ipcRenderer.removeAllListeners('window-type');
    };
  }, []);

  if (windowType === null) {
    return <div>Loading...</div>;
  }

  return windowType === 'main' ? <App /> : <AppConfig />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppContainer />
  </React.StrictMode>,
)

window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})
