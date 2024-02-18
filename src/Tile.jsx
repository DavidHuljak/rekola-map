function Tile({ pametnik, bikeNumber, bikeName }) {
  return (
    <div className="tile">
      <div className="prop">
        <span className="prop-label">Pamětník:</span> {pametnik}
      </div>
      <div className="prop">
        <span className="prop-label">Číslo kola:</span> {bikeNumber}
      </div>
      <div className="prop">
        <span className="prop-label">Jméno kola:</span> {bikeName}
      </div>
    </div>
  );
}

export default Tile;