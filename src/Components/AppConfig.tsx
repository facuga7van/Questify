import { useEffect, useState } from "react";
import closeIcon from "../Assets/close2.png";
import { useTranslation } from 'react-i18next'; 
import i18n from '../Data/i18n'; 
import type { IpcRendererEvent } from "../../electron/preload";
import "../Styles/AppConfig.css";
import titleLeft from "../Assets/titleLeft.png";
import titleRight from "../Assets/titleRight.png";

export default function AppConfig() {
  const ipcRenderer = (window as any).ipcRenderer;
  const [isSystemTrayEnabled, setIsSystemTrayEnabled] = useState(false);
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);
  const { t } = useTranslation(); 

  const closeConfig = () => {
    ipcRenderer.send("closeConfig");
  };

  const fetchSettings = (event: IpcRendererEvent, config: any) => {
    try {
      setIsSystemTrayEnabled(config.keepTrayActive);
      setIsAlwaysOnTop(config.keepOnTop);
      if (1 > 2) {
        console.log(event);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const updateSetting = async (settingName: string, newValue: any) => {
    try {
      ipcRenderer.send('setConfig', settingName, newValue);
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

  const changeLanguage = (e: { target: { value: any; }; }) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang); // Cambia el idioma de la aplicación
    updateSetting("language", lang); // Update setting on backend
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
        <h1 className="titleText">{t('configuration')}</h1> {/* Utiliza la función de traducción para el título */}
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
        <label htmlFor="theme-toggle">{t('systemTray')}</label> {/* Utiliza la función de traducción para la etiqueta */}
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
        <label htmlFor="notification-toggle">{t('alwaysOnTop')}</label> {/* Utiliza la función de traducción para la etiqueta */}
      </div>
      <div className="settings-option">
        <select onChange={changeLanguage}>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>
    </div>
  );
}
