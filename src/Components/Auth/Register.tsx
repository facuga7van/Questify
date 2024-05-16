import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../../AuthContext/index";
import titleLeft from "../../Assets/titleLeft.png";
import titleRight from "../../Assets/titleRight.png";
import { doCreateUserWithEmailAndPassword } from "../../Data/auth";
import "../../Styles/Signin.css";

const Register = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { userLoggedIn } = useAuth();
  const onSubmit = async (e: any) => {
    e.preventDefault();
    if (!isRegistering) {
      setIsRegistering(true);
      try{
        await doCreateUserWithEmailAndPassword(email, password);
      }catch(e){
        setErrorMessage(`Incorrect password or email. 
        Password must have at least 6 characters`)
        setIsRegistering(false)
      }
    }
  };

  return (
    <>
      {userLoggedIn && <Navigate to={"/"} replace={true} />}

      <main className="main-container">
        <div className="login-card">
          <div className="text-center mb-6">
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
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="form">Email</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                className="input"
              />
            </div>

            <div>
              <label className="form">
                Password
              </label>
              <input
                disabled={isRegistering}
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                className="input"
              />
            </div>

            <div>
              <label className="form">
                Confirm Password
              </label>
              <input
                disabled={isRegistering}
                type="password"
                autoComplete="off"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setconfirmPassword(e.target.value);
                }}
                className="input"
              />
            </div>

            {errorMessage && (
              <span className="error-message">{errorMessage}</span>
            )}

            <button
              type="submit"
              disabled={isRegistering}
              className={`button ${
                isRegistering
                  ? "button-disabled"
                  : "button-enabled"
              }`}
            >
              {isRegistering ? "Signing Up..." : "Sign Up"}
            </button>
            <div className="text-sm text-center">
              Already have an account? {"   "}
              <Link
                to={"/login"}
                className="link"
              >
                Continue
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default Register;
