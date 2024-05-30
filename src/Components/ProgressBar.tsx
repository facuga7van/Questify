import { useState, useEffect } from "react";
import "../Styles/ProgressBar.css";
import type { IpcRendererEvent } from "../../electron/preload";
import { useAuth } from "../AuthContext/index";


export default function Progressbar() {
  const ipcRenderer = (window as any).ipcRenderer;
const [level, setLevel] = useState(0);
const [filled, setFilled] = useState(0);
const [getXp, setGetXp] = useState(false);
const [userData, setUserData] = useState<any>(() => {
  const userData = localStorage.getItem("userData");
return userData ? JSON.parse(userData) : [];
});
const { currentUser } = useAuth();

useEffect(() => {
  const handleXPChange = (event: IpcRendererEvent, newXP: number) => {
    if(1>2){
      console.log(event);
        setUserData(true)
    }
    const calculatedLevel = newXP / 100;
    setLevel(Math.floor(calculatedLevel));
    userData.level = Math.floor(calculatedLevel);
    localStorage.setItem("userData", JSON.stringify(userData));
    const levelPercentage = calculatedLevel - Math.floor(calculatedLevel);
    setFilled(levelPercentage * 100);
    setGetXp(false);
  };

  // Request XP on initial render and listen for changes
  ipcRenderer.send("getXP", currentUser?.uid);
  ipcRenderer.on("sendXP", handleXPChange);

  // Cleanup function to remove listener on unmount
  return () => ipcRenderer.removeAllListeners("sendXP", handleXPChange);
}, [getXp]);

// Handle taskAdded event to trigger XP retrieval (optional)
useEffect(() => {
  const XPChange = (event: IpcRendererEvent) => {
    setGetXp(true);
    if(1>2){
      console.log(event);
    }
  };

  ipcRenderer.on("taskAdded", XPChange);

  // Cleanup function to remove listener on unmount
  return () => ipcRenderer.removeAllListeners("taskAdded", XPChange);
}, []);


  return (
    <div>
      <div className="progressbar">
        <div
          className="xpBar"
          style={{
            width: `${filled}%`,
            transition: "width 0.5s",
          }}
        />
        <span className="progressPercent">{level}</span>
        
      </div>
    </div>
  );
}
