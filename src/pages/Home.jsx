import "./Home.css";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import hero from "../assets/car.jpg";

function Home() {
  return (
    <>
      <Navbar />

      <div
        className="home"
        style={{
          backgroundImage: `url(${hero})`,
        }}
      >
        <section className="hero">
          <h1>🛡 SafeRoute BD</h1>

          <h2>Travel Safer Across Bangladesh</h2>

          <p>
            Report dangerous roads, explore safer routes,
            and help make Bangladesh safer.
          </p>

          <div className="buttons">
            <Link to="/explore-routes">
              <button className="primary-btn">
                🗺 Explore Routes
              </button>
            </Link>

            <Link to="/report-area">
              <button className="secondary-btn">
                🚨 Report Area
              </button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

export default Home;