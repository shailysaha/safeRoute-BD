import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

function RouteMachine({
  currentLocation,
  destination,
  setDistance,
  setDuration,
  onRouteCalculated,
}) {
  const map = useMap();

  useEffect(() => {
    if (
      !currentLocation ||
      !destination ||
      Number.isNaN(Number(currentLocation.lat)) ||
      Number.isNaN(Number(currentLocation.lng)) ||
      Number.isNaN(Number(destination.lat)) ||
      Number.isNaN(Number(destination.lng))
    ) {
      return undefined;
    }

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(
          Number(currentLocation.lat),
          Number(currentLocation.lng)
        ),
        L.latLng(
          Number(destination.lat),
          Number(destination.lng)
        ),
      ],

      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,

      lineOptions: {
        styles: [
          {
            color: "#2563eb",
            opacity: 0.9,
            weight: 6,
          },
        ],
      },
    }).addTo(map);

    routingControl.on("routesfound", (event) => {
      const route = event.routes?.[0];

      if (!route) {
        return;
      }

      const distanceKm = route.summary.totalDistance / 1000;
      const durationMinutes = route.summary.totalTime / 60;

      setDistance(distanceKm);
      setDuration(durationMinutes);

      if (onRouteCalculated) {
        onRouteCalculated(route);
      }
    });

    routingControl.on("routingerror", (event) => {
      console.error("Route calculation failed:", event);

      setDistance("");
      setDuration("");
    });

    return () => {
      map.removeControl(routingControl);
    };
  }, [
    map,
    currentLocation,
    destination,
    setDistance,
    setDuration,
    onRouteCalculated,
  ]);

  return null;
}

export default RouteMachine;