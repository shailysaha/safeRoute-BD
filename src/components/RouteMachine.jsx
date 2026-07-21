import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

// Fixed: Added onRouteFound to the component props destructured definition
function RouteMachine({ start, end, onRouteFound }) {
  const map = useMap();

  useEffect(() => {
    if (!start || !end) return;

    // Initialize the Leaflet Routing control
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start.lat, start.lng),
        L.latLng(end.lat, end.lng)
      ],
      lineOptions: {
        styles: [
          {
            color: "#2563eb",
            weight: 6
          }
        ]
      },
      createMarker: function(i, wp) {
        return L.marker(wp.latLng);
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false
    }).addTo(map);

    // Fixed: Listening to routing engine calculations to pass distance & time upwards
    routingControl.on("routesfound", function(e) {
      const route = e.routes[0];
      
      // Convert total distance from meters to kilometers
      const distance = (route.summary.totalDistance / 1000).toFixed(2);
      
      // Convert total duration from seconds to minutes
      const duration = Math.round(route.summary.totalTime / 60);

      if (onRouteFound) {
        onRouteFound(distance, duration);
      }
    });

    // Cleanup phase: Unmount control when location coordinates change or component unmounts
    return () => {
      map.removeControl(routingControl);
    };
  }, [start, end, map, onRouteFound]); // Fixed: Added onRouteFound to dependency array

  return null;
}

export default RouteMachine;

