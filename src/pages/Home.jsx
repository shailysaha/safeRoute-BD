import "./Home.css";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">
      <Navbar />

      <main className="home-hero">
        {/* Animated GIS background */}
        <div className="gis-background" aria-hidden="true">
          <svg
            viewBox="0 0 1600 900"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="gisGrid"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />

                <circle
                  cx="60"
                  cy="60"
                  r="1.5"
                  fill="currentColor"
                />
              </pattern>

              <filter
                id="greenGlow"
                x="-30%"
                y="-30%"
                width="160%"
                height="160%"
              >
                <feGaussianBlur
                  stdDeviation="7"
                  result="blur"
                />

                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter
                id="orangeGlow"
                x="-30%"
                y="-30%"
                width="160%"
                height="160%"
              >
                <feGaussianBlur
                  stdDeviation="8"
                  result="blur"
                />

                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect
              width="100%"
              height="100%"
              fill="url(#gisGrid)"
            />

            <path
              className="route-line route-line-green"
              d="M -100 230 Q 260 120 590 390 T 1420 330"
              fill="none"
              filter="url(#greenGlow)"
            />

            <path
              className="route-line route-line-orange"
              d="M 110 820 Q 450 480 890 590 T 1700 170"
              fill="none"
              filter="url(#orangeGlow)"
            />

            <path
              className="route-line route-line-blue"
              d="M 100 80 Q 420 350 800 190 T 1280 760"
              fill="none"
            />
          </svg>
        </div>

        <div className="hero-glow hero-glow-green" />
        <div className="hero-glow hero-glow-orange" />

        <section className="hero-content">
          <div className="live-update-badge">
            <span className="live-dot">
              <span className="live-dot-ping" />
              <span className="live-dot-core" />
            </span>

            <span>
              Community-powered road safety updates
            </span>
          </div>

          <div className="hero-card">
            <div className="hero-brand-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>

            <span className="hero-eyebrow">
              SMART SAFETY ROUTE PLATFORM
            </span>

            <h1>
              Travel Safer Across
              <span> Bangladesh</span>
            </h1>

            <p>
              Explore safer routes, 
              find nearby emergency services and
              report dangerous roads across Bangladesh.
            </p>

            <div className="hero-buttons">
              <Link
                to="/explore-routes"
                className="hero-primary-button"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>

                <span>Explore Safe Routes</span>
              </Link>

              <Link
                to="/report-area"
                className="hero-secondary-button"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>

                <span>Report Hazard</span>
              </Link>
            </div>
          </div>

          <div className="home-stats">
            <div className="home-stat-card">
              <span className="stat-icon">🛡️</span>

              <div>
                <strong>Safer Routes</strong>
                <small>
                  Report-aware route analysis
                </small>
              </div>
            </div>

            <div className="home-stat-card">
              <span className="stat-icon">📍</span>

              <div>
                <strong>Community Reports</strong>
                <small>
                  Recent road-safety information
                </small>
              </div>
            </div>

            <div className="home-stat-card">
              <span className="stat-icon">🚑</span>

              <div>
                <strong>Emergency Support</strong>
                <small>
                  Nearby police and hospitals
                </small>
              </div>
            </div>
          </div>

          <div className="home-scroll-indicator">
            <span>Scroll to explore</span>
            <div className="scroll-mouse">
              <span />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;