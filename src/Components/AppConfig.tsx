import  { useEffect, useState } from "react";
import closeIcon from "../Assets/close2.png";
import type { IpcRendererEvent } from "../../electron/preload";
import "../Styles/AppConfig.css";
import titleLeft from "../Assets/titleLeft.png";
import titleRight from "../Assets/titleRight.png";

export default function AppConfig() {
  const ipcRenderer = (window as any).ipcRenderer;
  const [isSystemTrayEnabled, setIsSystemTrayEnabled] = useState(false);
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);

  const closeConfig = () => {
    ipcRenderer.send("closeConfig");
  };


  const fetchSettings = (event: IpcRendererEvent, config: any) => {    try {
      setIsSystemTrayEnabled(config.keepTrayActive)
      setIsAlwaysOnTop(config.keepOnTop)
      if (1>2){
        console.log(event)
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const updateSetting = async (settingName: string, newValue: any) => {
    try {
      ipcRenderer.send('setConfig', settingName,newValue);
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };
  
  useEffect(() => {
    ipcRenderer.send('getConfig');
    ipcRenderer.on("sendConfig", fetchSettings);
  }, []);

  const handleSystemTrayChange = (event: { target: { checked: any } }) => {
    const isChecked = event.target.checked;
    setIsSystemTrayEnabled(isChecked);
    updateSetting("keepTrayActive", isChecked); // Update setting on backend
  };

  const handleAlwaysOnTopChange = (event: { target: { checked: any } }) => {
    const isChecked = event.target.checked;
    setIsAlwaysOnTop(isChecked);
    updateSetting("keepOnTop", isChecked); // Update setting on backend
  };

  return (
    <div className="app-config ">
      <div className="configHeader">
        <div className="btnBox">
          <div className="draggable"></div>
          <button className="closeBtn" onClick={closeConfig}>
            <img src={closeIcon} alt="Close" className="imageBtn" />
          </button>
        </div>
      </div>
      <div className="titleContainer">
        <img src={titleLeft} alt="Title Left" className="titleImage mx-2" />
        <h1 className="titleText">Configuration</h1>
        <img src={titleRight} alt="Title Right" className="titleImage mx-2" />
      </div>
      <div className="settings-option">
        <div className="checkbox-wrapper-2">
          <input
            type="checkbox"
            className="sc-gJwTLC ikxBAC"
            checked={isSystemTrayEnabled}
            onChange={handleSystemTrayChange}
          />{" "}
        </div>
        <label htmlFor="theme-toggle">System tray</label>
      </div>
      <div className="settings-option">
        <div className="checkbox-wrapper-2">
          <input
            type="checkbox"
            className="sc-gJwTLC ikxBAC"
            checked={isAlwaysOnTop}
            onChange={handleAlwaysOnTopChange}
          />{" "}
        </div>
        <label htmlFor="notification-toggle">Always on top</label>
      </div>
    </div>
  );
}
