import { useState, useEffect } from 'react';
import '../Styles/ProgressBar.css';
import { useNavigate } from 'react-router-dom'
import type { IpcRendererEvent } from '../../electron/preload';
import { useAuth } from '../AuthContext/index';
import { doSignOut } from '@/Data/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOut } from '@fortawesome/free-solid-svg-icons'

export default function Progressbar() {
  const ipcRenderer = (window as any).ipcRenderer;
  const [level, setLevel] = useState(0);
  const navigate = useNavigate()
  const [filled, setFilled] = useState(0);
  const [getXp, setGetXp] = useState(false);
  const { currentUser } = useAuth();
  useEffect(() => {
    setGetXp(true);
  }, []);

  useEffect(() => {
    const handleXPChange = (event: IpcRendererEvent, newXP: number) => {
      const calculatedLevel = (newXP / 100);
      setLevel(Math.floor(calculatedLevel));
      const levelPercentage = calculatedLevel - Math.floor(calculatedLevel);
	  // console.log(levelPercentage + ' ' + calculatedLevel)
      setFilled(levelPercentage * 100);
	  setGetXp(false);
      ipcRenderer.removeAllListeners('changeXP');
	  if (1>2){
		console.log(event)
	  }
	  
    };

    ipcRenderer.send('getXP',currentUser?.uid); 
    ipcRenderer.on('sendXP', handleXPChange); 
	ipcRenderer.removeAllListeners('taskAdded');
    return () => ipcRenderer.removeAllListeners('changeXP');
  }, [getXp]);
  const XPChange = (event: IpcRendererEvent) => {
    setGetXp(true)
    if (1 < 2) {
      console.log(event)
    }
    ipcRenderer.removeAllListeners('taskAdded');
  };

  ipcRenderer.on('taskAdded', XPChange);

  return (
    <div>
      <div className="progressbar">
        <div
          className="xpBar"
          style={{
            width: `${filled}%`,
            transition: 'width 0.5s',
          }}
        />
        <span className="progressPercent">
          {level}
        </span>
        <div className='text-right signOut'><button onClick={() => { doSignOut().then(() => { navigate('/') }) }} ><FontAwesomeIcon icon={faSignOut} /></button></div>
      </div>
    </div>
  );
}
