import PixiCharacter from "./Character";
import "../Styles/SideMenu.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doSignOut } from "@/Data/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOut } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/AuthContext";
import { subscribeUserDoc } from "@/Data/firestore";

export default function SideMenu() {
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const ipcRenderer = (window as any).ipcRenderer;
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const uid = currentUser?.uid;
    if (!uid) return;

    const unsub = subscribeUserDoc(uid, (raw) => {
      const normalized = {
        ...(raw ?? {}),
        userName: raw?.UserName ?? raw?.userName ?? "",
        email: raw?.Email ?? raw?.email ?? "",
      };
      localStorage.setItem("userData", JSON.stringify(normalized));
      setUserData(normalized);
    });
    return () => unsub();
  }, [currentUser?.uid]);

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const showConfig = () => {
    ipcRenderer.send('openConfig');
  };

  return (
    <>
      <div
        onMouseEnter={() => setShowSidebar(true)}
        onMouseLeave={() => setShowSidebar(false)}
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
              <h2>{userData ? (userData.userName ?? userData.UserName) : 'Cargando...'}</h2>
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
