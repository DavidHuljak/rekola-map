import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useMap } from "react-leaflet";
import axios from "axios";
import "leaflet-canvas-marker";
import L from "leaflet";
import bikeIcon from "./assets/bike.png";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";

import Button from "@mui/material/Button";
import { Link, Paper } from "@mui/material";

const App = () => {
  const [data, setData] = useState([]);
  const [schoolBikes, setSchoolBikes] = useState([]);

  const LeafletCanvasMarker = ({ data }) => {
    const map = useMap();

    useEffect(() => {
      if (!map) return;
      if (data.length === 0) return;

      const ciLayer = L.canvasIconLayer({}).addTo(map);

      const icon = L.icon({
        iconUrl: bikeIcon,
        iconSize: [40, 40],
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

    Promise.all([
      axios.get("https://api.huljak.cz/bikes/schoolRekola"),
      axios.get("https://api.huljak.cz/bikes/rekola"),
    ])
      .then(([schoolResponse, response]) => {
        if (isMounted) {
          const schoolBikesData = schoolResponse.data;
          setSchoolBikes(schoolBikesData);

          const matchedObjects = schoolBikesData
            .map((item) => {
              const match = response.data.find(
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

  return (
    <Box>
      <AppBar component="nav">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Pamětníci na rekolech
          </Typography>
          <Box>
            <Button
              sx={{ color: "#fff" }}
              href="https://rekola.gympn.cz"
              target="_blank"
            >
              Informace
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ p: 3 }}>
        <Toolbar />
        <Paper variant="outlined">
          <Box sx={{ width: "90%", height: "70vh", margin: "1rem auto" }}>
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
          </Box>
          <Typography variant="h4" sx={{ textAlign: "center", p: 2 }}>
            Aktuálně dostupná rekola:{" "}
            {data.filter((item) => item.matched).length} / {schoolBikes.length}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {data.map((item, index) => (
              <Card
                sx={{
                  m: 1.5,
                  minWidth: "250px",
                  maxWidth: "250px",
                  backgroundColor: item.matched ? "success.main" : "error.main",
                  color: item.matched ? "#fff" : "#fff",
                }}
                key={index}
                color="primary"
              >
                <CardContent>
                  <Typography sx={{ fontSize: 14 }} gutterBottom>
                    {item.bikeNumber}
                  </Typography>
                  <Typography variant="h5" component="div">
                    {item.pametnik}
                  </Typography>
                  <Typography variant="h6">
                    {item.matched ? item.data.vehicleName : "-"}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Typography variant="body1" sx={{ mt: 2, textAlign: "center" }}>
            Poslední aktualizace: {new Date().toLocaleString()}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, textAlign: "center" }}>
            Zdroj dat -{" "}
            <Link
              href="https://umotional.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              umotional.com
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default App;
