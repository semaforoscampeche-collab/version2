import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { X, MapPin, Check, Crosshair } from 'lucide-react';

// Fix leaflet default marker icons in bundlers
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: string;
  lng: string;
  onSave: (lat: string, lng: string) => void;
}

export const MapModal: React.FC<MapModalProps> = ({
  isOpen,
  onClose,
  lat,
  lng,
  onSave,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [currentLat, setCurrentLat] = React.useState(lat || '19.8438');
  const [currentLng, setCurrentLng] = React.useState(lng || '-90.5255');
  const [loadingGps, setLoadingGps] = React.useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setCurrentLat(lat || '19.8438');
    setCurrentLng(lng || '-90.5255');

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      const initialLat = parseFloat(lat) || 19.8438;
      const initialLng = parseFloat(lng) || -90.5255;

      if (!mapRef.current) {
        const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setCurrentLat(pos.lat.toFixed(6));
          setCurrentLng(pos.lng.toFixed(6));
        });

        map.on('click', (e) => {
          marker.setLatLng(e.latlng);
          setCurrentLat(e.latlng.lat.toFixed(6));
          setCurrentLng(e.latlng.lng.toFixed(6));
        });

        mapRef.current = map;
        markerRef.current = marker;
      } else {
        mapRef.current.invalidateSize();
        mapRef.current.setView([initialLat, initialLng], 15);
        if (markerRef.current) {
          markerRef.current.setLatLng([initialLat, initialLng]);
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, lat, lng]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalización no soportada en su navegador');
      return;
    }
    setLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoadingGps(false);
        const newLat = pos.coords.latitude.toFixed(6);
        const newLng = pos.coords.longitude.toFixed(6);
        setCurrentLat(newLat);
        setCurrentLng(newLng);
        if (mapRef.current && markerRef.current) {
          const latLng = L.latLng(pos.coords.latitude, pos.coords.longitude);
          mapRef.current.setView(latLng, 16);
          markerRef.current.setLatLng(latLng);
        }
      },
      (err) => {
        setLoadingGps(false);
        alert('No se pudo obtener la ubicación GPS: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    onSave(currentLat, currentLng);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 bg-[#691C32] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-300" />
            <h3 className="font-semibold text-base">Selección de Coordenadas Geográficas (GPS)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500 font-medium">Latitud:</span>{' '}
              <span className="font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-300">
                {currentLat}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Longitud:</span>{' '}
              <span className="font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-300">
                {currentLng}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={loadingGps}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
            >
              <Crosshair className={`w-3.5 h-3.5 text-[#691C32] ${loadingGps ? 'animate-spin' : ''}`} />
              {loadingGps ? 'Obteniendo GPS...' : 'Usar mi ubicación actual'}
            </button>
          </div>
        </div>

        <div className="relative w-full h-[380px] bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full z-10" />
          <div className="absolute bottom-2 left-2 z-20 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] text-slate-600 shadow-sm border border-slate-200 pointer-events-none">
            Haz clic en el mapa o arrastra el marcador para fijar la inspección
          </div>
        </div>

        <div className="px-5 py-3.5 bg-slate-100 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 text-sm bg-[#691C32] hover:bg-[#521527] text-white font-medium rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Aplicar Coordenadas
          </button>
        </div>
      </div>
    </div>
  );
};
