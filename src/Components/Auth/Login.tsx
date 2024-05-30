import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import titleLeft from "../../Assets/titleLeft.png";
import titleRight from "../../Assets/titleRight.png";
import { doSignInWithEmailAndPassword } from "../../Data/auth";
import { useAuth } from "../../AuthContext/index";
import "../../Styles/Login.css";
import { useTranslation } from "react-i18next";
const Login = () => {
  const { userLoggedIn } = useAuth();
  const ipcRenderer = (window as any).ipcRenderer;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { t } = useTranslation();

  const onSubmit = async (e: any) => {
    e.preventDefault();
    if (!isSigningIn) {
      ipcRenderer.send("getEmail", email);
      setIsSigningIn(true);
      try{
        await doSignInWithEmailAndPassword(email, password);
      }catch(e){
        setErrorMessage('Incorrect password or email')
        setIsSigningIn(false)
      }
    }
  };

  return (
    <div>
      {userLoggedIn && <Navigate to={"/"} replace={true} />}

      <main className="main-container">
        <div className="login-card">
          <div className="text-center ">
            <div className="mt-2 titleContainer mx-auto">
              <img
                src={titleLeft}
                alt="Title Left"
                className="titleImage mx-2"
              />
              <h3 className="titleText">Questify</h3>
              <img
                src={titleRight}
                alt="Title Right"
                className="titleImage mx-2"
              />
            </div>
          </div>
          <form onSubmit={onSubmit} className="form">
            <div>
              <label className="label">{t('emailuser')}</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="label">{t('password')}</label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </div>

            {errorMessage && (
              <span className="error-message">{errorMessage}</span>
            )}

            <button
              type="submit"
              disabled={isSigningIn}
              className={`button ${
                isSigningIn ? "button-disabled" : "button-enabled"
              }`}
            >
              {isSigningIn ? t("loging") : t("login")}
            </button>
          </form>
          <p className="text-center text-sm">
            {t('dontsigned')}
            <Link to={"/register"} className="link">
              {" "}{t('signup')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
