import PixiCharacter from "./Character";
import arrow from "../Assets/arrow.png"; // Assuming arrow image is imported
import edit from "../Assets/edit.png";
import titleLeft from "../Assets/titleLeft.png";
import titleRight from "../Assets/titleRight.png";
import { useEffect, useState } from "react";
import "../Styles/Profile.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/AuthContext";
import CharacterSelector from "./CharSelector";

export default function Profile() {
  const navigate = useNavigate();
  const ipcRenderer = (window as any).ipcRenderer;
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [getUserData, setGetUserData] = useState(false);

  const [isEdit, setIsEdit] = useState(false);
  const [isProfEdit, setIsProfEdit] = useState(false);

  useEffect(() => {
    if (getUserData) {
      setGetUserData(false);
      setUserData(JSON.parse(localStorage.getItem("userData") || '{}'));
      console.log(userData)
    }
  }, [getUserData]);

  useEffect(() => {
    setGetUserData(true);
  }, []);
  
  const handleEditClick = () => {
    setIsEdit(!isEdit);
  };
  const handleEditProfClick = () => {
    setIsProfEdit(!isProfEdit);
  };

  const handleSaveClick = () => {
    ipcRenderer.send(
      "setSignup",
      currentUser?.uid,
      userData.email,
      userData.userName
    );
    localStorage.setItem("userData", JSON.stringify(userData));
    setIsProfEdit(false);
  };

  const handleProfileClick = () => {
    navigate("/");
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [event.target.name]: event.target.value });
  };

  return (
    <>
      <div className="ProfileCont mx-auto py-auto flex flex-col items-center">
        <div className="titleContainer">
          <img src={titleLeft} alt="Title Left" className="titleImage" />
          <h1 className="profTitleText mx-6">Questify</h1>
          <img src={titleRight} alt="Title Right" className="titleImage" />
        </div>
        <div className="ProfileContInner">
          <div className="profile-header flex flex-col">
            <div className="w-full ProfBtns">
              <button className="backBtn" onClick={handleProfileClick}>
                <img src={arrow} alt="Go back" />
              </button>
              {!isProfEdit ? (
                <button className="editBtn" onClick={handleEditClick}>
                  <img src={edit} alt="Edit Profile" />
                </button>
              ) : (
                <></>
              )}
            </div>

            <div className="profile-picture">
              {isEdit ? <CharacterSelector /> : <PixiCharacter />}
            </div>
          </div>
          {isEdit ? (
            <></>
          ) : (
            <div className="profile-info flex">
              <ul>
                <li>
                <span className="label">Username:</span>
                {isProfEdit ? (
                  <input
                    type="text"
                    name="userName"
                    value={userData.userName}
                    onChange={handleInputChange}
                    className="editInput"
                  />
                
              ) : (
                <span className="value">{userData ? userData.UserName : 'Cargando...'}</span>
              )}
                </li>
                <li>
                  <span className="label">Email:</span>
                  {isProfEdit ? (
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    className="editInput"
                  />
                ) : (
                  <span className="value">{userData ? userData.Email : 'Cargando...'}</span>
                )}
                </li>

              </ul>
              {!isProfEdit ? (
                <div>
                  <button onClick={handleEditProfClick}>Edit Profile</button>
                </div>
              ) : (
                <div>
                  <button onClick={handleSaveClick}>Save Changes</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
