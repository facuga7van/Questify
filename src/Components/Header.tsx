import minimizeIcon from "../Assets/minimize2.png";
import closeIcon from "../Assets/close2.png";
import "../Styles/Header.css";

function Header() {
  const ipcRenderer = (window as any).ipcRenderer;

  const minimizeApp = () => {
    ipcRenderer.send("minimizeApp");
  };
  const closeApp = () => {
    ipcRenderer.send("closeApp");
  };

  return (
    <div className="custom-titlebar">
      <div className="titlebar draggable"></div>
      <div className="buttons">
        <div className="btnBox">
          <button className="minimizeBtn" onClick={minimizeApp}>
            <img src={minimizeIcon} alt="Minimize" className="imageBtn mx-2" />
          </button>
        </div>
        <div className="btnBox">
          <button className="closeBtn" onClick={closeApp}>
            <img src={closeIcon} alt="Close" className="imageBtn mx-2" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Header;
