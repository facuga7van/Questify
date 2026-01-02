import PixiCharacter from "./Character";
import arrow from "../Assets/arrow.png"; // Assuming arrow image is imported
import titleLeft from "../Assets/titleLeft.png";
import titleRight from "../Assets/titleRight.png";
import { useEffect, useState } from "react";
import "../Styles/Profile.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/AuthContext";
import CharacterSelector from "./CharSelector";
import { subscribeUserDoc } from "@/Data/firestore";

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

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

  useEffect(() => {
    // fallback rápido: algo en pantalla aunque Firestore tarde
    const cached = localStorage.getItem("userData");
    if (cached) setUserData(JSON.parse(cached));
  }, []);

  const handleProfileClick = () => {
    navigate("/");
  };

  return (
    <>
      <div className="ProfilePage mx-auto flex flex-col items-center">
        <div className="titleContainer">
          <img src={titleLeft} alt="Title Left" className="titleImage" />
          <h1 className="titleText mx-6">Questify</h1>
          <img src={titleRight} alt="Title Right" className="titleImage" />
        </div>
        <div className={`ProfileCard ${isEditingAvatar ? "is-editing" : ""}`}>
          <div className="ProfileCardHeader">
            <button className="backBtn" onClick={handleProfileClick} title="Volver">
              <img src={arrow} alt="Go back" />
            </button>
            <div className="ProfileCardTitle">
              Perfil
            </div>
            <div className="ProfileCardActions">
              {!isEditingAvatar ? (
                <button
                  className="rpgBtn profileActionBtn"
                  type="button"
                  onClick={() => setIsEditingAvatar(true)}
                >
                  Editar avatar
                </button>
              ) : (
                <button
                  className="rpgBtn profileActionBtn"
                  type="button"
                  onClick={() => setIsEditingAvatar(false)}
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>

          <div className="ProfileCardBody">
            <div className="ProfileTop">
              <div className="ProfileAvatarPanel">
                <div className={`ProfileAvatarFrame ${isEditingAvatar ? "is-editing" : ""}`}>
                  {!isEditingAvatar ? (
                    <PixiCharacter />
                  ) : (
                    <div className="ProfileAvatarEditor">
                      <div className="ProfileEditHeader">
                        <div className="ProfileEditTitle">Personalizar avatar</div>
                        <div className="ProfileEditHint">
                          Tocá las flechas para cambiar el pelo. Guardá cuando te guste.
                        </div>
                      </div>
                      <CharacterSelector stayOnSave />
                    </div>
                  )}
                </div>
              </div>

              {!isEditingAvatar && (
                <>
                  <div className="ProfileDivider" />
                  <div className="ProfileMeta">
                    <div className="ProfileName">
                      {userData ? (userData.userName ?? userData.UserName) : "Cargando..."}
                    </div>
                    <div className="ProfileEmail">
                      {userData ? (userData.email ?? userData.Email) : ""}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
