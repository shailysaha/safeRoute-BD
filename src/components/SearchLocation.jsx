import {
  useEffect,
  useRef,
  useState,
} from "react";

import "./SearchLocation.css";

function SearchLocation({
  onLocationSelect,
  placeholder = "Search location in Bangladesh...",
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchBoxRef = useRef(null);

  /* Close suggestion box when clicking outside */
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target)
      ) {
        setResults([]);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* Bangladesh-wide search */
  useEffect(() => {
    const cleanQuery = query.trim();

    if (cleanQuery.length < 3) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const url =
          "https://nominatim.openstreetmap.org/search?" +
          "format=jsonv2&" +
          "addressdetails=1&" +
          "countrycodes=bd&" +
          "limit=8&" +
          `q=${encodeURIComponent(cleanQuery)}`;

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Search failed: ${response.status}`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          setResults([]);
          setError(
            "Unable to read location results."
          );
          return;
        }

        setResults(data);

        if (data.length === 0) {
          setError(
            "No matching location found in Bangladesh."
          );
        }
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        console.error(
          "Location search error:",
          error
        );

        setResults([]);

        setError(
          "Location search is temporarily unavailable."
        );
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSelectLocation = (item) => {
    const address = item.address || {};

    const lat = Number(item.lat);
    const lng = Number(item.lon);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      setError("Invalid location coordinates.");
      return;
    }

    const place = {
      lat,
      lng,

      area:
        address.suburb ||
        address.neighbourhood ||
        address.quarter ||
        address.road ||
        address.village ||
        address.town ||
        item.name ||
        item.display_name?.split(",")[0] ||
        "",

      district:
        address.city ||
        address.city_district ||
        address.county ||
        address.state_district ||
        address.state ||
        "",

      name:
        item.display_name ||
        item.name ||
        "Selected location",
    };

    console.log(
      "Selected starting place:",
      place
    );

    setQuery(
      item.display_name ||
        item.name ||
        ""
    );

    setResults([]);
    setError("");

    onLocationSelect?.(place);
  };

  return (
    <div
      className="search-box"
      ref={searchBoxRef}
    >
      <div className="search-input-wrapper">
        <span className="search-location-icon">
          🔎
        </span>

        <input
          type="text"
          placeholder={placeholder}
          value={query}
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            setError("");
          }}
        />

        
      </div>

      {loading && (
        <div className="location-search-status">
          Searching Bangladesh...
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="search-results">
          {results.map((item) => (
            <button
              type="button"
              key={item.place_id}
              className="search-item"
              onClick={() =>
                handleSelectLocation(item)
              }
            >
              <span className="search-result-pin">
                📍
              </span>

              <span className="search-result-text">
                <strong>
                  {item.name ||
                    item.display_name?.split(
                      ","
                    )[0]}
                </strong>

                <small>
                  {item.display_name}
                </small>
              </span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="location-search-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default SearchLocation;