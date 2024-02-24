import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useMap } from "react-leaflet";
import axios from "axios";
import "leaflet-canvas-marker";
import L from "leaflet";
import "./App.css";
import Tile from "./Tile";
import bikeIcon from "./assets/bike.png";
import rekolaGPN from "./assets/rekolaData.json";

const apiEndpoint =
  "https://uc1.umotional.net/urbancyclers-api/v7/bikeSharingInfo?lat=50.0755&lon=14.4378&radius=20000";
export default function App() {
  const [data, setData] = useState([]);

  const LeafletCanvasMarker = ({ data }) => {
    const map = useMap();

    useEffect(() => {
      if (!map) return;
      if (data.length === 0) return;

      const ciLayer = L.canvasIconLayer({}).addTo(map);

      const icon = L.icon({
        iconUrl: bikeIcon,
        iconSize: [42, 34],
        iconAnchor: [10, 10],
      });

      const markers = data
        .filter((vehicle) => vehicle.matched === true)
        .map((matchedVehicle) => {
          const lat = matchedVehicle.data.lat;
          const lon = matchedVehicle.data.lon;
          const vehicleName = matchedVehicle.data.vehicleName;
          const pametnik = matchedVehicle.pametnik;

          return L.marker([lat, lon], {
            icon: icon,
          }).bindPopup(pametnik + " - " + vehicleName);
        });

      ciLayer.addLayers(markers);
    }, [map, data]);

    return null;
  };

  useEffect(() => {
    let isMounted = true;

    axios
      .get(apiEndpoint)
      .then((response) => {
        const features = response.data.features;
        const newData = [];

        features.forEach((feature) => {
          const coordinates = feature.geometry.coordinates;
          const freeVehicles = feature.properties.freeVehicles;
          const providerId = feature.properties.providerId;

          if (providerId !== "REKOLA") return;
          if (Array.isArray(freeVehicles)) {
            freeVehicles.forEach((vehicle) => {
              const vehicleName = vehicle.vehicleName;
              const vehicleId = vehicle.vehicleId;

              newData.push({
                lat: coordinates[1],
                lon: coordinates[0],
                vehicleName: vehicleName !== "" ? vehicleName : "-",
                vehicleId: vehicleId,
                providerId: providerId,
              });
            });
          }
        });

        if (isMounted) {
          const matchedObjects = rekolaGPN
            .map((item) => {
              const match = newData.find(
                (anotherItem) => item.bikeID === anotherItem.vehicleId
              );
              return match
                ? { ...item, data: match, matched: true }
                : { ...item, matched: false };
            })
            .filter((match) => match !== null);

          setData((prev) => [...prev, ...matchedObjects]);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  console.log(data);

  return (
    <>
      <h1>Pamětníci na rekolech</h1>
      <div className="mapWrapper">
        <MapContainer
          center={[50.08688641405796, 14.435691833496096]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          className="mapContainer"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
          />
          <LeafletCanvasMarker data={data} />
        </MapContainer>
      </div>
      <div className="available">
        Aktuálně dostupná rekola: {data.filter((item) => item.matched).length} /{" "}
        {rekolaGPN.length}
      </div>
      <div className="tileWrapper">
        {data.map((item, index) => (
          <div key={index}>
            <Tile
              classData={item.matched ? "tile" : "tile unmatched"}
              pametnik={item.pametnik}
              bikeNumber={item.bikeNumber}
              bikeName={item.matched ? item.data.vehicleName : "-"}
            />
          </div>
        ))}
      </div>

      <footer>
        Poslední aktualizace: {new Date().toLocaleString()} | Zdroj dat -{" "}
        <a
          href="https://umotional.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          umotional.com
        </a>
      </footer>
    </>
  );
}
