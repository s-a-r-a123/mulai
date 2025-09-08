import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, useMap, Marker } from "react-leaflet";
import L from "leaflet";
import jsPDF from "jspdf";
import "leaflet/dist/leaflet.css";

// Fix marker icons for Vite bundling
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Component to move map when coordinates are searched
function MapMover({ coords }) {
  const map = useMap();
  if (coords) {
    map.setView(coords, 10);
  }
  return null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("map");
  const [decision, setDecision] = useState(null);
  const [position, setPosition] = useState(null);
  const [purpose, setPurpose] = useState("Commercial");
  const [claimed, setClaimed] = useState(false);
  const [appealed, setAppealed] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [coords, setCoords] = useState(null);
  const markerRef = useRef(null);

  // Simulate backend decision
  function analyzeClaim(lat, lon, purpose) {
    let decision = "Claim Rejected";
    let reason = "Land is protected area";

    if (purpose === "Commercial" && lat > 15 && lon > 75) {
      decision = "Claim Approved";
      reason = "Land suitable for commercial use";
    } else if (purpose === "Industrial") {
      decision = "Further Review Required";
      reason = "Environmental clearance needed";
    }

    return { decision, reason, lat, lon, purpose };
  }

  function handleMapClick(e) {
    setPosition(e.latlng);
    setDecision(null);
    setClaimed(false);
    setAppealed(false);
  }

  function handleClaim() {
    if (!position) return alert("Select a location on map first!");
    const result = analyzeClaim(position.lat, position.lng, purpose);
    setDecision(result);
    setClaimed(true);
    setActiveTab("decision");
  }

  function handleAppeal() {
    setAppealed(true);
    setActiveTab("appeal");
  }

  function downloadReport() {
    const doc = new jsPDF();
    doc.text("Decision Report", 20, 20);
    if (decision) {
      doc.text(`Decision: ${decision.decision}`, 20, 40);
      doc.text(`Reason: ${decision.reason}`, 20, 50);
      doc.text(`Purpose: ${decision.purpose}`, 20, 60);
      doc.text(`Coordinates: ${decision.lat}, ${decision.lon}`, 20, 70);
    } else {
      doc.text("No decision available", 20, 40);
    }
    doc.save("report.pdf");
  }

  async function handleSearch(e) {
    e.preventDefault();

    const parts = searchInput.split(",");
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lon = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lon)) {
        setCoords([lat, lon]);
        setPosition({ lat, lng: lon });
        return;
      }
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchInput
        )}`
      );
      const data = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setCoords([lat, lon]);
        setPosition({ lat, lng: lon });
      } else {
        alert("Place not found");
      }
    } catch (err) {
      alert("Error fetching location");
    }
  }

  return (
    <div style={{ height: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Top Navbar */}
      <div
        style={{
          background: "#1a237e",
          color: "white",
          padding: "15px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>🌱 Mullai</h2>
        <div>
          <span style={{ margin: "0 15px", cursor: "pointer" }} onClick={() => setActiveTab("map")}>
            🗺️ Map
          </span>
          <span style={{ margin: "0 15px", cursor: "pointer" }} onClick={() => setActiveTab("about")}>
            ℹ️ About
          </span>
          <span style={{ margin: "0 15px", cursor: "pointer" }} onClick={() => setActiveTab("decision")}>
            📄 Decision
          </span>
          <span style={{ margin: "0 15px", cursor: "pointer" }} onClick={() => setActiveTab("appeal")}>
            ⚖️ Appeal
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ height: "calc(100% - 60px)" }}>
        {activeTab === "map" && (
          <div style={{ display: "flex", height: "100%" }}>
            <div style={{ width: "70%", height: "100%" }}>
              <MapContainer
                center={[20, 80]}
                zoom={5}
                style={{ height: "100%", width: "100%" }}
                whenCreated={(map) => {
                  map.on("click", handleMapClick);
                }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {position && <Marker ref={markerRef} position={position}></Marker>}
                <MapMover coords={coords} />
              </MapContainer>
            </div>

            <div style={{ padding: 20, width: "30%", background: "#f9f9f9" }}>
              <h2>Land Claim</h2>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter coordinates (lat, lon) or place name"
                  style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />
                <button type="submit" style={{ padding: "8px", width: "100%" }}>
                  🔍 Search
                </button>
              </form>

              <label><b>Purpose of Land:</b></label><br />
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                style={{ width: "100%", padding: "8px", margin: "10px 0" }}
              >
                <option>Commercial</option>
                <option>Protected</option>
                <option>Industrial</option>
                <option>Agricultural</option>
              </select>

              <button
                onClick={handleClaim}
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  background: "#1a237e",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Claim Now
              </button>
            </div>
          </div>
        )}

        {activeTab === "decision" && (
          <div style={{ padding: 30 }}>
            <h2 style={{ color: "#1a237e" }}>📄 Decision</h2>
            {claimed && decision ? (
              <div>
                <p><b>Decision:</b> {decision.decision}</p>
                <p><b>Reason:</b> {decision.reason}</p>
                <p><b>Purpose:</b> {decision.purpose}</p>
                <p><b>Coordinates:</b> {decision.lat}, {decision.lon}</p>
                <button
                  onClick={downloadReport}
                  style={{ marginTop: "10px", padding: "10px", background: "green", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                >
                  Download Report (PDF)
                </button>
                <button
                  onClick={handleAppeal}
                  style={{ marginTop: "10px", marginLeft: "10px", padding: "10px", background: "orange", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                >
                  Appeal Decision
                </button>
              </div>
            ) : (
              <p>No claim submitted yet.</p>
            )}
          </div>
        )}

        {activeTab === "appeal" && (
          <div style={{ padding: 30 }}>
            <h2 style={{ color: "#1a237e" }}>⚖️ Appeal Claim</h2>
            {appealed ? <p>Your appeal has been submitted for review.</p> : <p>No appeal made yet.</p>}
          </div>
        )}

        {activeTab === "about" && (
          <div style={{ padding: 30 }}>
            <h2 style={{ color: "#1a237e" }}>ℹ️ About Mullai</h2>
            <p>
              Mullai helps communities and officials analyze land claims under the Forest Rights Act. 
              Users can select a land location, state the purpose of use, and get decisions based on rules 
              and AI analysis. Claims can also be appealed for review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

