/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, useMemo } from "react";
import { Celula, CellStatus, Rede, Usuario } from "../types";
import { MapPin, Filter, Layers, ZoomIn, ZoomOut, AlertTriangle, Compass } from "lucide-react";

interface SGCMapProps {
  celulas: Celula[];
  redes: Rede[];
  usuarios: Usuario[];
  selectedRedId: string;
  setSelectedRedId: (id: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  cidade?: string;
}

// Bairros of Petrópolis RJ for quick filter
const keyBairros = [
  "Todos",
  "Centro",
  "Quitandinha",
  "Alto da Serra",
  "Bingen",
  "Itaipava",
  "Retiro",
  "Corrêas",
];

export default function SGCMap({
  celulas,
  redes,
  usuarios,
  selectedRedId,
  setSelectedRedId,
  selectedStatus,
  setSelectedStatus,
  cidade,
}: SGCMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [selectedBairro, setSelectedBairro] = useState("Todos");
  const [cityCoords, setCityCoords] = useState<[number, number] | null>(null);

  // Dynamic city coordinates effect based on Nominatim OpenStreetMap API
  useEffect(() => {
    if (!cidade) {
      setCityCoords(null);
      return;
    }

    const presetCities: Record<string, [number, number]> = {
      petropolis: [-22.5049, -43.1784],
      "petrópolis": [-22.5049, -43.1784],
      "rio de janeiro": [-22.9068, -43.1729],
      "sao paulo": [-23.5505, -46.6333],
      "são paulo": [-23.5505, -46.6333],
    };

    const lowercaseCity = cidade.toLowerCase().trim();
    if (presetCities[lowercaseCity]) {
      setCityCoords(presetCities[lowercaseCity]);
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(cidade + ", Brasil")}`;
    
    let active = true;
    fetch(url, {
      headers: {
        "User-Agent": "SgcCellMaps/1.0"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (active && data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setCityCoords([lat, lon]);
        }
      })
      .catch((err) => {
        console.warn("Dynamic geocoding failed", err);
      });

    return () => {
      active = false;
    };
  }, [cidade]);

  // Load Leaflet CDN Assets dynamically
  useEffect(() => {
    // Check if Leaflet is already loaded
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    // Load css
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.id = "leaflet-css-cdn";
    document.head.appendChild(link);

    // Load js
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.id = "leaflet-js-cdn";
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    script.onerror = () => {
      setLoadingError(true);
    };
    document.body.appendChild(script);

    return () => {
      // Keep css/js to prevent blinking during edits, but can cleans up if needed
    };
  }, []);

  // Filtered cells to display on the map
  const filteredCelulas = useMemo(() => {
    return celulas.filter((cell) => {
      const matchRed = !selectedRedId || cell.rede_id === selectedRedId;
      const matchStatus = !selectedStatus || cell.status_celula === selectedStatus;
      const matchBairro = selectedBairro === "Todos" || cell.bairro.toLowerCase() === selectedBairro.toLowerCase();
      return matchRed && matchStatus && matchBairro;
    });
  }, [celulas, selectedRedId, selectedStatus, selectedBairro]);

  // Leaflet map initialization
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Centered around Petrópolis, RJ
    const petropolisCoords = [-22.5049, -43.1784];

    // Initialize Map Instance if not created yet
    if (!leafletMapInstanceRef.current) {
      try {
        const map = L.map(mapRef.current, {
          center: petropolisCoords,
          zoom: 13,
          zoomControl: false, // Custom position control
        });

        // Use a gorgeous, modern clean tile layer (CartoDB Positron / Voyage) for modern UX matching Notion/ClickUp
        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }).addTo(map);

        // Add custom zoom controls
        L.control.zoom({
          position: "bottomright",
        }).addTo(map);

        leafletMapInstanceRef.current = map;
        markersGroupRef.current = L.featureGroup().addTo(map);
      } catch (err) {
        console.error("Leaflet initialization failed", err);
        setLoadingError(true);
      }
    }

    const mapInstance = leafletMapInstanceRef.current;
    const markersGroup = markersGroupRef.current;

    if (!mapInstance || !markersGroup) return;

    // Clear old markers first
    markersGroup.clearLayers();

    // Map status to marker color hex
    const statusColors: Record<CellStatus, string> = {
      [CellStatus.VERDE]: "#10B981",   // emerald-500
      [CellStatus.AMARELO]: "#F59E0B", // amber-500
      [CellStatus.VERMELHO]: "#EF4444",// red-500
      [CellStatus.AZUL]: "#3B82F6",    // blue-500
    };

    // Plot new markers
    filteredCelulas.forEach((cell) => {
      const leader = usuarios.find((u) => u.id === cell.lider_id);
      const rede = redes.find((r) => r.id === cell.rede_id);
      const color = statusColors[cell.status_cellula] || "#10B981";

      // HTML custom divIcon for a beautiful glowing vector-like point matching modern styling guidelines
      const customHtmlIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-6 w-6 animate-ping rounded-full opacity-40" style="background-color: ${color};"></span>
            <div class="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-white shadow-md transition-transform hover:scale-125 duration-150" style="background-color: ${color};">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cross"><path d="M11 2h2v20h-2z"/><path d="M2 9h20v2z"/></svg>
            </div>
          </div>
        `,
        className: "custom-leaflet-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });

      // Construct rich HTML popup
      const popupContent = `
        <div class="p-2 font-sans" style="min-width: 200px;">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="text-xs font-semibold px-2 py-0.5 rounded text-white" style="background-color: ${color};">
              ${cell.status_cellula === CellStatus.VERDE ? "Saudável" : cell.status_cellula === CellStatus.AMARELO ? "Poucas Pessoas" : cell.status_cellula === CellStatus.VERMELHO ? "Baixa Freq." : "Multiplicação"}
            </span>
            <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">${cell.bairro}</span>
          </div>
          <h4 class="text-sm font-bold text-slate-800 m-0 mb-1">${cell.nome_celula}</h4>
          <p class="text-[11px] text-slate-500 m-0 mb-1.5">📌 ${cell.endereco_completo}</p>
          
          <div class="border-t border-slate-100 pt-1.5 space-y-1 text-xs">
            <div class="flex justify-between text-slate-600">
              <span class="font-medium text-slate-400">Líder:</span>
              <span class="font-semibold text-slate-700">${leader ? leader.nome.split(" ")[0] : "Não atribuído"}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span class="font-medium text-slate-400">Rede:</span>
              <span style="color: ${rede ? rede.cor : "#475569"}; font-weight: 600;">${rede ? rede.nome : "-"}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span class="font-medium text-slate-400">Reunião:</span>
              <span class="font-semibold text-slate-700">${cell.dia_semana} às ${cell.horario}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span class="font-medium text-slate-400">Integrantes:</span>
              <span class="font-bold text-slate-800 bg-slate-100 px-1 rounded font-mono">${cell.quantidade_integrantes}</span>
            </div>
          </div>
        </div>
      `;

      L.marker([cell.latitude, cell.longitude], { icon: customHtmlIcon })
        .addTo(markersGroup)
        .bindPopup(popupContent, {
          closeButton: false,
          maxWidth: 280,
        });
    });

    // Auto fit mapbounds with padding when marker is available
    if (filteredCelulas.length > 0) {
      try {
        mapInstance.fitBounds(markersGroup.getBounds(), {
          padding: [30, 30],
          maxZoom: 15,
        });
      } catch (e) {
        // Safe fail
      }
    }
  }, [filteredCelulas, leafletLoaded, usuarios, redes]);

  // Dynamic pan/fly to city center if town coordinates configured and empty cells list
  useEffect(() => {
    if (!leafletMapInstanceRef.current || !cityCoords || filteredCelulas.length > 0) return;
    try {
      leafletMapInstanceRef.current.setView(cityCoords, 13);
    } catch (e) {
      console.warn("Could not center map to city coords", e);
    }
  }, [cityCoords, filteredCelulas.length]);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[520px]" id="sgc_map_widget">
      {/* Map Control Header */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Mapa de Células ({cidade || "Petrópolis"})</h3>
            <p className="text-[11px] text-slate-500">
              Georreferenciamento em tempo real de {filteredCelulas.length} células cadastradas
            </p>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Bairros Filter */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-xs">
            <span className="font-medium text-slate-400">Região:</span>
            <select
              value={selectedBairro}
              onChange={(e) => setSelectedBairro(e.target.value)}
              className="font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              {keyBairros.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Redes Filter */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-xs">
            <span className="font-medium text-slate-400">Rede:</span>
            <select
              value={selectedRedId}
              onChange={(e) => setSelectedRedId(e.target.value)}
              className="font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="">Todas Redes</option>
              {redes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-xs">
            <span className="font-medium text-slate-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="">Todos Status</option>
              <option value={CellStatus.VERDE}>🟢 Saudável (4-11 pessoas)</option>
              <option value={CellStatus.AMARELO}>🟡 Alerta: Poucas (&lt;4)</option>
              <option value={CellStatus.AZUL}>🔵 Alerta: Multiplicar (&gt;=12)</option>
              <option value={CellStatus.VERMELHO}>🔴 Alerta: Baixa Freq.</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map Map/Fallback Screen */}
      <div className="relative flex-1 bg-slate-50 flex items-center justify-center">
        {leafletLoaded && !loadingError ? (
          <div ref={mapRef} id="leaflet-map-element" className="absolute inset-0 z-0" />
        ) : (
          <div className="text-center p-8 max-w-sm flex flex-col items-center">
            <div className="p-4 bg-yellow-50 text-amber-500 rounded-full mb-3 shadow-inner">
              <AlertTriangle className="h-8 w-8 animate-pulse" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">
              {loadingError ? "Erro ao carregar o Mapa" : "Conectando ao Mapa..."}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              {loadingError
                ? "Não foi possível carregar as dependências geográficas de Leaflet.js. Carregando interface de geolocalização simulada de alta precisão."
                : "Estamos buscando os dados georreferenciados de Petrópolis para montar o mapa interativo."}
            </p>
            
            {/* Hard fallback representation */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs w-full text-left font-mono text-[10px] text-slate-400 max-h-[140px] overflow-y-auto">
              <div>📍 Petrópolis - RJ Centro: Active</div>
              {filteredCelulas.map((c) => (
                <div key={c.id} className="truncate text-slate-600 border-t border-slate-100 pt-1 mt-1">
                  • {c.nome_celula} ({c.bairro}) - Lat: {c.latitude.toFixed(4)}, Lng: {c.longitude.toFixed(4)} {c.quantidade_integrantes} memb.
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Elegant status legend float */}
        <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-2 border border-slate-200/80 rounded-xl shadow-md space-y-1 text-[10px] hidden sm:block">
          <div className="font-bold text-slate-700 mb-1 flex items-center gap-1 border-b border-slate-100 pb-1">
            <Layers className="h-3.5 w-3.5 text-blue-500" /> Legenda de Status
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block border border-white shrink-0"></span>
            <span>Saudável (4-11 pessoas)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block border border-white shrink-0"></span>
            <span>Poucas Pessoas (&lt;4 pessoas)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block border border-white shrink-0"></span>
            <span>Pronto p/ Multiplicação (&gt;=12)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 block border border-white shrink-0"></span>
            <span>Baixa Frequência (&lt;=2 encontros/mês)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
