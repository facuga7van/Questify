import '../Styles/Footer.css';
import type { IpcRendererEvent } from '../../electron/preload';
import { useEffect } from 'react';
import Progressbar from './ProgressBar';


function Footer() {
  const ipcRenderer = (window as any).ipcRenderer;
  
  const showMessage = (event: IpcRendererEvent, message: string) => {
    const footerWarningElement = document.querySelector('.footerWarning') as Element;
    if (1>2){
      console.log(event)
    }
    console.log('upd')
  if (footerWarningElement) {
    footerWarningElement.textContent = message;
  }
  };

  useEffect(()=>{ipcRenderer.on('checkingUdp', showMessage);},[])
  
 
  return (
    
    <div className="custom-footer">
      <div className='footerWarning'></div>
      <Progressbar/>
    </div>
  );
}

export default Footer;
