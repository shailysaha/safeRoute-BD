import "./SOSButton.css";

function SOSButton({ onSOS }) {
  return (
    <button
      className="sos-button"
      onClick={onSOS}
    >
      🚨
      <br />
      SOS
    </button>
  );
}

export default SOSButton;