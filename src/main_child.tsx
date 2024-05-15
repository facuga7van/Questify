import React from 'react'
import ReactDOM from 'react-dom/client'
import AppConfig from './Components/AppConfig';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppConfig />
  </React.StrictMode>,
)

window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})

