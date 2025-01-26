"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";
import "./styles.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface Pametnik {
  name: string;
  bikeID: string;
  path: string;
}

interface Bike {
  lat: number;
  lon: number;
  vehicleName: string;
  vehicleId: string;
}

export default function Home() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [pametnici, setPametnici] = useState<Pametnik[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pametnikResponse, rekolaResponse] = await Promise.all([
          axios.get("https://api.huljak.cz/school/rekola-project"),
          axios.get("https://api.huljak.cz/bikes/rekola"),
        ]);

        setPametnici(pametnikResponse.data);
        setBikes(rekolaResponse.data);
        setLastUpdate(new Date().toLocaleString("cs-CZ").slice(0, -3));

        if (!map.current) {
          map.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: "mapbox://styles/mapbox/light-v10",
            center: [14.4378, 50.0755],
            zoom: 11,
          });

          map.current.addControl(new mapboxgl.NavigationControl());

          const matchedBikes = rekolaResponse.data.filter((bike: Bike) =>
            pametnikResponse.data.some(
              (pametnik: Pametnik) => pametnik.bikeID === bike.vehicleId
            )
          );

          console.log(matchedBikes);

          map.current.on("load", () => {
            matchedBikes.forEach((bike: Bike) => {
              const matchedPametnik = pametnikResponse.data.find(
                (pametnik: Pametnik) => pametnik.bikeID === bike.vehicleId
              );
              if (matchedPametnik) {
                const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
                  <div class="map-popup">
                    <h3>${matchedPametnik.name}</h3>
                    <p>ID kola: ${bike.vehicleId}</p>
                    <p>Jméno kola: ${bike.vehicleName}</p>
                  </div>
                `);

                new mapboxgl.Marker({ color: "#2563eb" })
                  .setLngLat([bike.lon, bike.lat])
                  .setPopup(popup)
                  .addTo(map.current!);
              }
            });
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const sortedPametnici = [...pametnici].sort((a, b) => {
    const aHasBike = bikes.some((bike) => bike.vehicleId === a.bikeID);
    const bHasBike = bikes.some((bike) => bike.vehicleId === b.bikeID);
    if (aHasBike && !bHasBike) return -1;
    if (!aHasBike && bHasBike) return 1;
    return 0;
  });

  return (
    <div className="app">
      <header>
        <h1>Pamětníci na rekolech</h1>
        <a
          href="https://rekola.gympn.cz"
          target="_blank"
          rel="noopener noreferrer"
          className="info-button"
        >
          Více informací
        </a>
      </header>

      <main>
        <div ref={mapContainer} className="map-container" />

        <section className="pametnici-list">
          <h2>Seznam pamětníků</h2>
          <div className="cards-grid">
            {sortedPametnici.map((pametnik) => {
              const matchingBike = bikes.find(
                (bike) => bike.vehicleId === pametnik.bikeID
              );
              return (
                <div key={pametnik.bikeID} className="card">
                  <div className="card-content">
                    <a
                      href={`https://rekola.gympn.cz/${pametnik.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pametnik-name"
                    >
                      <h3>{pametnik.name}</h3>
                    </a>
                    <p className="bike-id">
                      <strong>ID kola:</strong> {pametnik.bikeID}
                    </p>
                    {matchingBike ? (
                      <p className="bike-name">
                        <strong>Jméno kola:</strong> {matchingBike.vehicleName}
                      </p>
                    ) : (
                      <p className="bike-unavailable">
                        Kolo není momentálně nasazeno
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer>
        <p>Poslední aktualizace: {lastUpdate}</p>
        <p>
          Zdroj dat:{" "}
          <a
            href="https://umotional.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Umotional
          </a>
        </p>
      </footer>
    </div>
  );
}
