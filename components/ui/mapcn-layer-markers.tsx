"use client";

import MapLibreGL, { type PopupOptions, type MarkerOptions } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X, Minus, Plus, Locate, Maximize, Loader2 } from "lucide-react";

function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}

const defaultStyles = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

type Theme = "light" | "dark";

function getDocumentTheme(): Theme | null {
  if (typeof document === "undefined") return null;
  if (document.documentElement.classList.contains("dark")) return "dark";
  if (document.documentElement.classList.contains("light")) return "light";
  return null;
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function useResolvedTheme(themeProp?: "light" | "dark"): Theme {
  const [detectedTheme, setDetectedTheme] = useState<Theme>(() => getDocumentTheme() ?? getSystemTheme());
  useEffect(() => {
    if (themeProp) return;
    const observer = new MutationObserver(() => {
      const docTheme = getDocumentTheme();
      if (docTheme) setDetectedTheme(docTheme);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (!getDocumentTheme()) setDetectedTheme(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleSystemChange);
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, [themeProp]);
  return themeProp ?? detectedTheme;
}

type MapContextValue = { map: MapLibreGL.Map | null; isLoaded: boolean };
const MapContext = createContext<MapContextValue | null>(null);

function useMap() {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMap must be used within a Map component");
  return context;
}

type MapViewport = { center: [number, number]; zoom: number; bearing: number; pitch: number };
type MapStyleOption = string | MapLibreGL.StyleSpecification;
type MapRef = MapLibreGL.Map;

type MapProps = {
  children?: ReactNode;
  className?: string;
  theme?: Theme;
  styles?: { light?: MapStyleOption; dark?: MapStyleOption };
  projection?: MapLibreGL.ProjectionSpecification;
  viewport?: Partial<MapViewport>;
  onViewportChange?: (viewport: MapViewport) => void;
  loading?: boolean;
} & Omit<MapLibreGL.MapOptions, "container" | "style">;

function DefaultLoader() {
  return (
    <div className="bg-black/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
      <div className="flex gap-1">
        <span className="bg-white/60 size-1.5 animate-pulse rounded-full" />
        <span className="bg-white/60 size-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
        <span className="bg-white/60 size-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function getViewport(map: MapLibreGL.Map): MapViewport {
  const c = map.getCenter();
  return { center: [c.lng, c.lat], zoom: map.getZoom(), bearing: map.getBearing(), pitch: map.getPitch() };
}

const Map = forwardRef<MapRef, MapProps>(function Map(
  { children, className, theme: themeProp, styles, projection, viewport, onViewportChange, loading = false, ...props },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const currentStyleRef = useRef<MapStyleOption | null>(null);
  const styleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const internalUpdateRef = useRef(false);
  const resolvedTheme = useResolvedTheme(themeProp);
  const isControlled = viewport !== undefined && onViewportChange !== undefined;
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;
  const mapStyles = useMemo(() => ({ dark: styles?.dark ?? defaultStyles.dark, light: styles?.light ?? defaultStyles.light }), [styles]);

  useImperativeHandle(ref, () => mapInstance as MapLibreGL.Map, [mapInstance]);

  const clearStyleTimeout = useCallback(() => {
    if (styleTimeoutRef.current) { clearTimeout(styleTimeoutRef.current); styleTimeoutRef.current = null; }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const initialStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
    currentStyleRef.current = initialStyle;
    const map = new MapLibreGL.Map({
      container: containerRef.current,
      style: initialStyle,
      renderWorldCopies: false,
      attributionControl: { compact: true },
      ...props,
      ...viewport,
    });
    const styleDataHandler = () => {
      clearStyleTimeout();
      styleTimeoutRef.current = setTimeout(() => {
        setIsStyleLoaded(true);
        if (projection) map.setProjection(projection);
      }, 100);
    };
    const loadHandler = () => setIsLoaded(true);
    const handleMove = () => {
      if (internalUpdateRef.current) return;
      onViewportChangeRef.current?.(getViewport(map));
    };
    map.on("load", loadHandler);
    map.on("styledata", styleDataHandler);
    map.on("move", handleMove);
    setMapInstance(map);
    return () => {
      clearStyleTimeout();
      map.off("load", loadHandler);
      map.off("styledata", styleDataHandler);
      map.off("move", handleMove);
      map.remove();
      setIsLoaded(false);
      setIsStyleLoaded(false);
      setMapInstance(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstance || !isControlled || !viewport) return;
    if (mapInstance.isMoving()) return;
    const current = getViewport(mapInstance);
    const next = {
      center: viewport.center ?? current.center,
      zoom: viewport.zoom ?? current.zoom,
      bearing: viewport.bearing ?? current.bearing,
      pitch: viewport.pitch ?? current.pitch,
    };
    if (next.center[0] === current.center[0] && next.center[1] === current.center[1] && next.zoom === current.zoom && next.bearing === current.bearing && next.pitch === current.pitch) return;
    internalUpdateRef.current = true;
    mapInstance.jumpTo(next);
    internalUpdateRef.current = false;
  }, [mapInstance, isControlled, viewport]);

  useEffect(() => {
    if (!mapInstance || !resolvedTheme) return;
    const newStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
    if (currentStyleRef.current === newStyle) return;
    clearStyleTimeout();
    currentStyleRef.current = newStyle;
    setIsStyleLoaded(false);
    mapInstance.setStyle(newStyle, { diff: true });
  }, [mapInstance, resolvedTheme, mapStyles, clearStyleTimeout]);

  const contextValue = useMemo(() => ({ map: mapInstance, isLoaded: isLoaded && isStyleLoaded }), [mapInstance, isLoaded, isStyleLoaded]);

  return (
    <MapContext.Provider value={contextValue}>
      <div ref={containerRef} className={cn("relative h-full w-full", className)}>
        {(!isLoaded || loading) && <DefaultLoader />}
        {mapInstance && children}
      </div>
    </MapContext.Provider>
  );
});

type MarkerContextValue = { marker: MapLibreGL.Marker; map: MapLibreGL.Map | null };
const MarkerContext = createContext<MarkerContextValue | null>(null);

function useMarkerContext() {
  const context = useContext(MarkerContext);
  if (!context) throw new Error("Marker components must be used within MapMarker");
  return context;
}

type MapMarkerProps = {
  longitude: number;
  latitude: number;
  children: ReactNode;
  onClick?: (e: MouseEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onDragStart?: (lngLat: { lng: number; lat: number }) => void;
  onDrag?: (lngLat: { lng: number; lat: number }) => void;
  onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
} & Omit<MarkerOptions, "element">;

function MapMarker({ longitude, latitude, children, onClick, onMouseEnter, onMouseLeave, onDragStart, onDrag, onDragEnd, draggable = false, ...markerOptions }: MapMarkerProps) {
  const { map } = useMap();
  const cbRef = useRef({ onClick, onMouseEnter, onMouseLeave, onDragStart, onDrag, onDragEnd });
  cbRef.current = { onClick, onMouseEnter, onMouseLeave, onDragStart, onDrag, onDragEnd };

  const marker = useMemo(() => {
    const m = new MapLibreGL.Marker({ ...markerOptions, element: document.createElement("div"), draggable }).setLngLat([longitude, latitude]);
    m.getElement()?.addEventListener("click", (e: MouseEvent) => cbRef.current.onClick?.(e));
    m.getElement()?.addEventListener("mouseenter", (e: MouseEvent) => cbRef.current.onMouseEnter?.(e));
    m.getElement()?.addEventListener("mouseleave", (e: MouseEvent) => cbRef.current.onMouseLeave?.(e));
    m.on("dragstart", () => { const ll = m.getLngLat(); cbRef.current.onDragStart?.({ lng: ll.lng, lat: ll.lat }); });
    m.on("drag", () => { const ll = m.getLngLat(); cbRef.current.onDrag?.({ lng: ll.lng, lat: ll.lat }); });
    m.on("dragend", () => { const ll = m.getLngLat(); cbRef.current.onDragEnd?.({ lng: ll.lng, lat: ll.lat }); });
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    marker.addTo(map);
    return () => { marker.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  if (marker.getLngLat().lng !== longitude || marker.getLngLat().lat !== latitude) marker.setLngLat([longitude, latitude]);
  if (marker.isDraggable() !== draggable) marker.setDraggable(draggable);

  return <MarkerContext.Provider value={{ marker, map }}>{children}</MarkerContext.Provider>;
}

function MarkerContent({ children, className }: { children?: ReactNode; className?: string }) {
  const { marker } = useMarkerContext();
  return createPortal(
    <div className={cn("relative cursor-pointer", className)}>
      {children || <div className="relative h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />}
    </div>,
    marker.getElement(),
  );
}

function MarkerTooltip({ children, className, ...popupOptions }: { children: ReactNode; className?: string } & Omit<PopupOptions, "className" | "closeButton" | "closeOnClick">) {
  const { marker, map } = useMarkerContext();
  const container = useMemo(() => document.createElement("div"), []);
  const tooltip = useMemo(() => new MapLibreGL.Popup({ offset: 16, ...popupOptions, closeOnClick: true, closeButton: false }).setMaxWidth("none"), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!map) return;
    tooltip.setDOMContent(container);
    const onEnter = () => tooltip.setLngLat(marker.getLngLat()).addTo(map);
    const onLeave = () => tooltip.remove();
    marker.getElement()?.addEventListener("mouseenter", onEnter);
    marker.getElement()?.addEventListener("mouseleave", onLeave);
    return () => {
      marker.getElement()?.removeEventListener("mouseenter", onEnter);
      marker.getElement()?.removeEventListener("mouseleave", onLeave);
      tooltip.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return createPortal(
    <div className={cn("bg-black text-white pointer-events-none rounded-md px-2 py-1 text-xs shadow-md", className)}>
      {children}
    </div>,
    container,
  );
}

function MarkerLabel({ children, className, position = "top" }: { children: ReactNode; className?: string; position?: "top" | "bottom" }) {
  const positionClasses = { top: "bottom-full mb-1", bottom: "top-full mt-1" };
  return (
    <div className={cn("absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-white text-[10px] font-medium", positionClasses[position], className)}>
      {children}
    </div>
  );
}

function PopupCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Close" className="absolute top-0.5 right-0.5 z-10 inline-flex size-5 cursor-pointer items-center justify-center rounded-sm text-white/70 hover:text-white hover:bg-white/10 transition">
      <X className="size-3.5" />
    </button>
  );
}

type MapPopupProps = {
  longitude: number;
  latitude: number;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  closeButton?: boolean;
} & Omit<PopupOptions, "className" | "closeButton">;

function MapPopup({ longitude, latitude, onClose, children, className, closeButton = false, ...popupOptions }: MapPopupProps) {
  const { map } = useMap();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const container = useMemo(() => document.createElement("div"), []);
  const popup = useMemo(() => new MapLibreGL.Popup({ offset: 16, ...popupOptions, closeButton: false }).setMaxWidth("none").setLngLat([longitude, latitude]), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!map) return;
    const onCloseProp = () => onCloseRef.current?.();
    popup.on("close", onCloseProp);
    popup.setDOMContent(container);
    popup.addTo(map);
    return () => { popup.off("close", onCloseProp); if (popup.isOpen()) popup.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  if (popup.isOpen() && (popup.getLngLat().lng !== longitude || popup.getLngLat().lat !== latitude)) popup.setLngLat([longitude, latitude]);

  return createPortal(
    <div className={cn("relative max-w-72 rounded-md border border-spotter-line bg-spotter-panel text-white p-3 shadow-xl", className)}>
      {closeButton && <PopupCloseButton onClick={() => popup.remove()} />}
      {children}
    </div>,
    container,
  );
}

type MapControlsProps = {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showZoom?: boolean;
  showCompass?: boolean;
  showLocate?: boolean;
  showFullscreen?: boolean;
  className?: string;
  onLocate?: (coords: { longitude: number; latitude: number }) => void;
};

const posCls = {
  "top-left": "top-2 left-2",
  "top-right": "top-2 right-2",
  "bottom-left": "bottom-2 left-2",
  "bottom-right": "bottom-10 right-2",
};

function ControlGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col overflow-hidden rounded-md border border-spotter-line bg-spotter-panel shadow-sm">{children}</div>;
}

function ControlButton({ onClick, label, children, disabled = false }: { onClick: () => void; label: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button onClick={onClick} aria-label={label} type="button" disabled={disabled}
      className="flex size-8 items-center justify-center text-white hover:bg-white/10 transition disabled:opacity-50 disabled:pointer-events-none">
      {children}
    </button>
  );
}

function MapControls({ position = "bottom-right", showZoom = true, showCompass = false, showLocate = false, showFullscreen = false, className, onLocate }: MapControlsProps) {
  const { map } = useMap();
  const [waiting, setWaiting] = useState(false);

  const onZoomIn = useCallback(() => map?.zoomTo(map.getZoom() + 1, { duration: 300 }), [map]);
  const onZoomOut = useCallback(() => map?.zoomTo(map.getZoom() - 1, { duration: 300 }), [map]);
  const onResetBearing = useCallback(() => map?.resetNorthPitch({ duration: 300 }), [map]);
  const onLocateClick = useCallback(() => {
    setWaiting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { longitude: pos.coords.longitude, latitude: pos.coords.latitude };
          map?.flyTo({ center: [coords.longitude, coords.latitude], zoom: 14, duration: 1500 });
          onLocate?.(coords);
          setWaiting(false);
        },
        () => setWaiting(false),
      );
    }
  }, [map, onLocate]);
  const onFullscreen = useCallback(() => {
    const c = map?.getContainer();
    if (!c) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else c.requestFullscreen();
  }, [map]);

  return (
    <div className={cn("absolute z-10 flex flex-col gap-1.5", posCls[position], className)}>
      {showZoom && (
        <ControlGroup>
          <ControlButton onClick={onZoomIn} label="Zoom in"><Plus className="size-4" /></ControlButton>
          <ControlButton onClick={onZoomOut} label="Zoom out"><Minus className="size-4" /></ControlButton>
        </ControlGroup>
      )}
      {showCompass && (
        <ControlGroup>
          <ControlButton onClick={onResetBearing} label="Reset bearing">
            <svg viewBox="0 0 24 24" className="size-5">
              <path d="M12 2L16 12H12V2Z" className="fill-spotter-orange" />
              <path d="M12 2L8 12H12V2Z" className="fill-spotter-orange/60" />
              <path d="M12 22L16 12H12V22Z" className="fill-white/40" />
              <path d="M12 22L8 12H12V22Z" className="fill-white/20" />
            </svg>
          </ControlButton>
        </ControlGroup>
      )}
      {showLocate && (
        <ControlGroup>
          <ControlButton onClick={onLocateClick} label="Find my location" disabled={waiting}>
            {waiting ? <Loader2 className="size-4 animate-spin" /> : <Locate className="size-4" />}
          </ControlButton>
        </ControlGroup>
      )}
      {showFullscreen && (
        <ControlGroup>
          <ControlButton onClick={onFullscreen} label="Toggle fullscreen"><Maximize className="size-4" /></ControlButton>
        </ControlGroup>
      )}
    </div>
  );
}

/** GeoJSON cluster layer — best for showing many points efficiently */
type MapClusterLayerProps<P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties> = {
  data: string | GeoJSON.FeatureCollection<GeoJSON.Point, P>;
  clusterMaxZoom?: number;
  clusterRadius?: number;
  clusterColors?: [string, string, string];
  clusterThresholds?: [number, number];
  pointColor?: string;
  onPointClick?: (feature: GeoJSON.Feature<GeoJSON.Point, P>, coordinates: [number, number]) => void;
  onClusterClick?: (clusterId: number, coordinates: [number, number], pointCount: number) => void;
};

function MapClusterLayer<P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties>({
  data,
  clusterMaxZoom = 14,
  clusterRadius = 50,
  clusterColors = ["#FF7A2E", "#FF3D5A", "#A855F7"],
  clusterThresholds = [25, 200],
  pointColor = "#FF7A2E",
  onPointClick,
  onClusterClick,
}: MapClusterLayerProps<P>) {
  const { map, isLoaded } = useMap();
  const id = useId();
  const sourceId = `cluster-source-${id}`;
  const clusterLayerId = `clusters-${id}`;
  const clusterCountLayerId = `cluster-count-${id}`;
  const unclusteredLayerId = `unclustered-${id}`;

  useEffect(() => {
    if (!isLoaded || !map) return;
    map.addSource(sourceId, { type: "geojson", data, cluster: true, clusterMaxZoom, clusterRadius });
    map.addLayer({
      id: clusterLayerId, type: "circle", source: sourceId, filter: ["has", "point_count"],
      paint: {
        "circle-color": ["step", ["get", "point_count"], clusterColors[0], clusterThresholds[0], clusterColors[1], clusterThresholds[1], clusterColors[2]],
        "circle-radius": ["step", ["get", "point_count"], 20, clusterThresholds[0], 30, clusterThresholds[1], 40],
        "circle-stroke-width": 2, "circle-stroke-color": "#fff", "circle-opacity": 0.85,
      },
    });
    map.addLayer({
      id: clusterCountLayerId, type: "symbol", source: sourceId, filter: ["has", "point_count"],
      layout: { "text-field": "{point_count_abbreviated}", "text-font": ["Open Sans"], "text-size": 12 },
      paint: { "text-color": "#fff" },
    });
    map.addLayer({
      id: unclusteredLayerId, type: "circle", source: sourceId, filter: ["!", ["has", "point_count"]],
      paint: { "circle-color": pointColor, "circle-radius": 6, "circle-stroke-width": 2, "circle-stroke-color": "#fff" },
    });
    return () => {
      try {
        if (map.getLayer(clusterCountLayerId)) map.removeLayer(clusterCountLayerId);
        if (map.getLayer(unclusteredLayerId)) map.removeLayer(unclusteredLayerId);
        if (map.getLayer(clusterLayerId)) map.removeLayer(clusterLayerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map, sourceId]);

  useEffect(() => {
    if (!isLoaded || !map || typeof data === "string") return;
    const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
    if (source) source.setData(data);
  }, [isLoaded, map, data, sourceId]);

  useEffect(() => {
    if (!isLoaded || !map) return;
    const onClusterClickFn = async (e: MapLibreGL.MapMouseEvent & { features?: MapLibreGL.MapGeoJSONFeature[] }) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [clusterLayerId] });
      if (!features.length) return;
      const feature = features[0];
      const clusterId = feature.properties?.cluster_id as number;
      const pointCount = feature.properties?.point_count as number;
      const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
      if (onClusterClick) onClusterClick(clusterId, coords, pointCount);
      else {
        const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
        const zoom = await source.getClusterExpansionZoom(clusterId);
        map.easeTo({ center: coords, zoom });
      }
    };
    const onPointClickFn = (e: MapLibreGL.MapMouseEvent & { features?: MapLibreGL.MapGeoJSONFeature[] }) => {
      if (!onPointClick || !e.features?.length) return;
      const feature = e.features[0];
      const coords = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
      while (Math.abs(e.lngLat.lng - coords[0]) > 180) coords[0] += e.lngLat.lng > coords[0] ? 360 : -360;
      onPointClick(feature as unknown as GeoJSON.Feature<GeoJSON.Point, P>, coords);
    };
    const onEnter = () => { map.getCanvas().style.cursor = "pointer"; };
    const onLeave = () => { map.getCanvas().style.cursor = ""; };
    map.on("click", clusterLayerId, onClusterClickFn);
    map.on("click", unclusteredLayerId, onPointClickFn);
    map.on("mouseenter", clusterLayerId, onEnter);
    map.on("mouseleave", clusterLayerId, onLeave);
    map.on("mouseenter", unclusteredLayerId, onEnter);
    map.on("mouseleave", unclusteredLayerId, onLeave);
    return () => {
      map.off("click", clusterLayerId, onClusterClickFn);
      map.off("click", unclusteredLayerId, onPointClickFn);
      map.off("mouseenter", clusterLayerId, onEnter);
      map.off("mouseleave", clusterLayerId, onLeave);
      map.off("mouseenter", unclusteredLayerId, onEnter);
      map.off("mouseleave", unclusteredLayerId, onLeave);
    };
  }, [isLoaded, map, clusterLayerId, unclusteredLayerId, sourceId, onClusterClick, onPointClick]);

  return null;
}

export { Map, useMap, MapMarker, MarkerContent, MarkerTooltip, MarkerLabel, MapPopup, MapControls, MapClusterLayer };
export type { MapRef, MapViewport };
