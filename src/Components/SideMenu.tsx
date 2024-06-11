import PixiCharacter from "./Character";
import "../Styles/SideMenu.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doSignOut } from "@/Data/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOut } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { IpcRendererEvent } from "electron";
import { useAuth } from "@/AuthContext";

export default function SideMenu() {
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const ipcRenderer = (window as any).ipcRenderer;
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [getUserData, setGetUserData] = useState(false);

  useEffect(() => {
    const handleUserData = (event: IpcRendererEvent, userData: any) => {
      localStorage.setItem("userData", JSON.stringify(userData));
      setGetUserData(false);
      setUserData(JSON.parse(localStorage.getItem("userData") || '{}'));
    };

    if (getUserData) {
      ipcRenderer.send("getUserData", currentUser?.uid);
    }
    ipcRenderer.on("sendUserData", handleUserData);
    return () => {
      ipcRenderer.removeAllListeners("sendUserData", handleUserData);
    };
  }, [getUserData]);

  useEffect(() => {
    setGetUserData(true);
  }, []);

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const showConfig = () => {
    ipcRenderer.send('openConfig');
  };

  return (
    <>
      <div
        onMouseEnter={() => setShowSidebar(!showSidebar)}
        onMouseLeave={() => setShowSidebar(!showSidebar)}
      >
        <div className={`PixiCont ${showSidebar ? "PixiCont--active" : ""}`}>
          <PixiCharacter />
        </div>

        <div
          className={`SideMenuContainer ${
            showSidebar
              ? "SideMenuContainer-active"
              : "SideMenuContainer-hidden"
          }`}
        >
          <div className="SideMenuContent">
            <div className="UserName">
              <h2>{userData ? userData.UserName : 'Cargando...'}</h2>
            </div>
            <ul className="SideMenuUl">
              <li>
                <a onClick={handleProfileClick}>Perfil</a>
              </li>
              <li>
                <a title={t('tooltipComingSoon')}>Aldea</a>
              </li>
              <li>
                <a onClick={showConfig}>Configuracion</a>
              </li>
            </ul>
            <div className="text-right signOut">
              <button
                onClick={() => {
                  doSignOut().then(() => {
                    navigate("/");
                  });
                }}
              >
                <FontAwesomeIcon icon={faSignOut} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
