import '../Styles/Loading.css'; // Import your Loading CSS file

function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p className="loading-text">Cargando...</p>
    </div>
  );
}

export default Loading;
