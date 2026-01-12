import { Navigation } from "@/components/Navigation";
import { useState } from "react";
import { TacticalCard } from "@/components/TacticalCard";
import { Button } from "@/components/ui/button";
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default leaflet markers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

import livoniaMap from "@assets/Livonia_Hiking_Map2_1768246587626.webp";

const MAPS = {
  LIVONIA: {
    id: "livonia",
    name: "LIVONIA",
    image: livoniaMap,
    bounds: [[0, 0], [1000, 1000]] as L.LatLngBoundsExpression,
  },
  CHERNARUS: {
    id: "chernarus",
    name: "CHERNARUS",
    image: "https://dayz.ginfo.gg/chernarusplus/map.jpg", // Placeholder until provided
    bounds: [[0, 0], [1000, 1000]] as L.LatLngBoundsExpression,
  }
};

interface MarkerData {
  id: number;
  pos: [number, number];
  label: string;
}

function MapEvents({ onMapClick }: { onMapClick: (e: any) => void }) {
  useMapEvents({
    click: onMapClick,
  });
  return null;
}

export default function Maps() {
  const [activeMap, setActiveMap] = useState(MAPS.LIVONIA);
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const handleMapClick = (e: any) => {
    const newMarker: MarkerData = {
      id: Date.now(),
      pos: [e.latlng.lat, e.latlng.lng],
      label: `Marker ${markers.length + 1}`
    };
    setMarkers([...markers, newMarker]);
  };

  return (
    <div className="min-h-screen bg-black font-sans pb-12 sm:pb-20">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-tactical text-white uppercase tracking-tighter">
            TACTICAL <span className="text-red-600">MAPS</span>
          </h1>
          
          <div className="flex gap-2">
            {Object.values(MAPS).map((map) => (
              <Button
                key={map.id}
                variant={activeMap.id === map.id ? "default" : "outline"}
                onClick={() => {
                  setActiveMap(map);
                  setMarkers([]);
                }}
                className={activeMap.id === map.id ? "bg-red-600 hover:bg-red-500" : "border-white/20 text-white"}
              >
                {map.name}
              </Button>
            ))}
          </div>
        </div>

        <TacticalCard title={`${activeMap.name} SURVIVAL GRID`} className="p-0 overflow-hidden border-white/10">
          <div className="h-[600px] sm:h-[800px] w-full bg-zinc-950">
            <MapContainer
              center={[500, 500]}
              zoom={1}
              scrollWheelZoom={true}
              crs={L.CRS.Simple}
              className="h-full w-full"
              style={{ background: '#09090b' }}
            >
              <ImageOverlay
                url={activeMap.image}
                bounds={activeMap.bounds}
              />
              <MapEvents onMapClick={handleMapClick} />
              {markers.map((marker) => (
                <Marker key={marker.id} position={marker.pos}>
                  <Popup className="font-mono">
                    <div className="p-1">
                      <p className="font-bold text-red-600">{marker.label}</p>
                      <p className="text-xs text-gray-500">LAT: {marker.pos[0].toFixed(2)}</p>
                      <p className="text-xs text-gray-500">LNG: {marker.pos[1].toFixed(2)}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 mt-2 text-xs text-red-400 hover:text-red-300 p-0"
                        onClick={() => setMarkers(markers.filter(m => m.id !== marker.id))}
                      >
                        REMOVE
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div className="p-4 bg-black/80 border-t border-white/10 flex justify-between items-center">
            <p className="text-xs font-mono text-gray-500">
              [SYSTEM] CLICK ANYWHERE ON GRID TO PLACE TACTICAL MARKER
            </p>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                 <span className="text-[10px] font-mono text-red-500 uppercase">Live Signal</span>
               </div>
            </div>
          </div>
        </TacticalCard>
      </div>
    </div>
  );
}
