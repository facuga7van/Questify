import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import titleLeft from "../../Assets/titleLeft.png";
import titleRight from "../../Assets/titleRight.png";
import { doSignInWithEmailAndPassword } from "../../Data/auth";
import { useAuth } from "../../AuthContext/index";
import "../../Styles/Login.css";
const Login = () => {
  const { userLoggedIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (e: any) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      await doSignInWithEmailAndPassword(email, password);
      // doSendEmailVerification()
      if (1>2){
        setErrorMessage('a')
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
              <label className="label">Email</label>
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
              <label className="label">Password</label>
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
              {isSigningIn ? "Logging In..." : "Log In"}
            </button>
          </form>
          <p className="text-center text-sm">
            Don't have an account?{" "}
            <Link to={"/register"} className="link">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
