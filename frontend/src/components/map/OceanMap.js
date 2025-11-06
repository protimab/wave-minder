import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// custom marker icons
const createCustomIcon = (emoji, color) => L.divIcon({
  html: `<div style="background: ${color}; border-radius: 50%; padding: 8px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <span style="font-size: 20px;">${emoji}</span>
  </div>`,
  className: 'custom-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const icons = {
  sighting: createCustomIcon('🐋', '#3b82f6'),
  report: createCustomIcon('🏖️', '#f59e0b'),
  action: createCustomIcon('♻️', '#10b981')
};

const OceanMap = ({ sightings = [], reports = [], actions = [], center = [32.8509, -117.2713] }) => {
  const [filter, setFilter] = useState('all');

  const allPoints = [
    ...sightings.map(s => ({ ...s, type: 'sighting' })),
    ...reports.map(r => ({ ...r, type: 'report' })),
    ...actions.map(a => ({ ...a, type: 'action' }))
  ].filter(item => item.latitude && item.longitude);

  const filteredPoints = filter === 'all' 
    ? allPoints 
    : allPoints.filter(p => p.type === filter);

  return (
    <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-200 overflow-hidden">
      {/* map controls */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-bold text-white">Ocean Activity Map</h2>
          <div className="text-white text-sm bg-white/20 px-3 py-1 rounded-full">
            {filteredPoints.length} locations
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'All', count: allPoints.length },
            { key: 'sighting', label: '🐋 Sightings', count: sightings.length },
            { key: 'report', label: '🏖️ Reports', count: reports.length },
            { key: 'action', label: '♻️ Actions', count: actions.length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === key 
                  ? 'bg-white text-blue-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* map */}
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: '600px', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {filteredPoints.map((point, index) => (
          <Marker
            key={`${point.type}-${point.id}`}
            position={[point.latitude, point.longitude]}
            icon={icons[point.type]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-1">
                  {point.species_name || point.beach_name || point.title}
                </h3>
                <p className="text-sm text-gray-600 capitalize mb-2">{point.type}</p>
                {point.location_name && (
                  <p className="text-sm">📍 {point.location_name}</p>
                )}
                {point.notes && (
                  <p className="text-sm text-gray-700 mt-2 italic">{point.notes}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  By {point.user_name}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default OceanMap;