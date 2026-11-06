import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { motion, AnimatePresence } from "motion/react";
import { MapPin } from "lucide-react";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// We'll focus exactly on Africa: [Longitude, Latitude]
const centerCoordinates: [number, number] = [20, 0]; 

const regions = [
  {
    name: "West Africa",
    coordinates: [-2.0, 12.0],
    focus: "Policy Labs & Diplomacy",
    color: "#cca568",
  },
  {
    name: "East Africa",
    coordinates: [35.0, 1.0],
    focus: "Digital Governance & Innovation",
    color: "#cca568",
  },
  {
    name: "Southern Africa",
    coordinates: [25.0, -25.0],
    focus: "Economic Policy & Market Systems",
    color: "#cca568",
  },
  {
    name: "North Africa",
    coordinates: [10.0, 30.0],
    focus: "Geopolitics & Cultural Integration",
    color: "#cca568",
  },
  {
    name: "Central Africa",
    coordinates: [20.0, -2.0],
    focus: "Resource Management & Sustainability",
    color: "#cca568",
  },
];

export default function AfricanMap() {
  const [activeRegion, setActiveRegion] = useState<any>(null);

  // ID of African countries in 110m topjson roughly ranges... actually, we'll just color the whole map dynamically.
  // A better way is to color all geographies black/dark gray, then add interactive markers.

  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center bg-[#050505] rounded-[32px] overflow-hidden border border-white/5">
      <div className="absolute inset-0 bg-[#cca568]/5 opacity-20 blur-[100px]" />
      
      {/* Tooltip Overlay */}
      <AnimatePresence>
        {activeRegion && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-8 left-8 z-20 bg-[#1a1a1a]/90 backdrop-blur-md p-6 rounded-2xl border border-[#cca568]/30 max-w-sm pointer-events-none shadow-[0_0_30px_rgba(204,165,104,0.15)]"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#cca568] animate-pulse" />
              <h4 className="text-[#cca568] font-bold text-lg">{activeRegion.name}</h4>
            </div>
            <p className="text-gray-300 text-sm">
              <span className="text-white/60 text-xs uppercase tracking-wider block mb-1">Key Focus</span>
              {activeRegion.focus}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 450,
          center: centerCoordinates,
        }}
        width={800}
        height={600}
        style={{
          width: "100%",
          height: "100%",
          maxHeight: "600px",
        }}
      >
        <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                // Determine if it's an African country (Continent = "Africa" usually, but world-110m might rely on ISO or shapes. 
                // We'll just style all countries neutrally, and let the bounding box visually crop out others.
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#15151a"
                    stroke="#2a2a35"
                    strokeWidth={0.5}
                    style={{
                      default: { fill: "#15151a", outline: "none" },
                      hover: { fill: "#cca568", opacity: 0.1, outline: "none" },
                      pressed: { fill: "#15151a", outline: "none" },
                    }}
                  />
                )
              })
            }
          </Geographies>

          {regions.map((region, i) => (
            <Marker 
              key={i} 
              coordinates={region.coordinates as [number, number]}
              onMouseEnter={() => setActiveRegion(region)}
              onMouseLeave={() => setActiveRegion(null)}
              style={{
                default: { outline: "none", cursor: "pointer" },
                hover: { outline: "none", cursor: "pointer" },
                pressed: { outline: "none", cursor: "pointer" },
              }}
            >
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.3 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <circle r={8} fill={region.color} opacity={0.3} />
                <circle r={4} fill={region.color} />
                <MapPin 
                  x="-8" 
                  y="-20" 
                  size={16} 
                  color={region.color}
                  strokeWidth={2.5}
                  className="filter drop-shadow-lg"
                />
              </motion.g>
            </Marker>
          ))}
      </ComposableMap>

      <div className="absolute bottom-6 right-6 flex flex-col gap-2 pointer-events-none">
        <div className="text-white/40 text-xs font-mono uppercase tracking-widest text-right">
          Continental Reach
        </div>
        <div className="w-16 h-[1px] bg-[#cca568]/30 self-end" />
      </div>
    </div>
  );
}
