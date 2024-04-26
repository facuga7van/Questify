import '../Styles/Footer.css';
import type { IpcRendererEvent } from '../../electron/preload';
import { useEffect } from 'react';


function Footer() {
  const ipcRenderer = (window as any).ipcRenderer;

  useEffect(() => {
    const showMessage = (event: IpcRendererEvent, message: string) => {
      const footerWarningElement = document.querySelector('.footerWarning') as Element;
      if (1<2){
        console.log(event)
      }
    if (footerWarningElement) {
      footerWarningElement.textContent = message;
    }
    };
    
    ipcRenderer.on('checkingUdp', showMessage);

    return () => {
      ipcRenderer.removeAllListeners('checkingUdp', showMessage);
    };
  });

  
 
  return (
    <div className="custom-footer">
      <div className="footerWarning"></div>
    </div>
  );
}

export default Footer;
