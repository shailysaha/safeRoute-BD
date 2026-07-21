import { useState, useEffect } from "react";
import "./SearchLocation.css";

function SearchLocation({ onLocationSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        // Added &addressdetails=1 to the fetch URL to retrieve structured address data
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
            query
          )}&countrycodes=bd&limit=5`
        );

        const data = await response.json();

        setResults(data);
      } catch (error) {
        console.log(error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="search-box">
      <input
        type="text"
        placeholder="🔍 Search location..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {results.length > 0 && (
        <div className="search-results">
          {results.map((item) => (
            <div
              key={item.place_id}
              className="search-item"
              onClick={() => {
                console.log("Raw API Item:", item);

                const address = item.address || {};
                
                const place = {
                  lat: Number(item.lat),
                  lng: Number(item.lon),
                  area:
                    address.suburb ||
                    address.neighbourhood ||
                    address.village ||
                    address.town ||
                    address.city ||
                    item.display_name,
                  district:
                    address.city ||
                    address.county ||
                    address.state_district ||
                    "",
                  name: item.display_name,
                };

                console.log("Constructed Place:", place);

                setQuery(item.display_name);
                setResults([]);

                if (onLocationSelect) {
                  onLocationSelect(place);
                }
              }}
            >
              📍 {item.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchLocation;