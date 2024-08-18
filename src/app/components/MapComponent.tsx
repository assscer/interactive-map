"use client";

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import FeatureInfo from './FeatureInfo'; // Импорт компонента для отображения информации
import { fetchBuildingData } from './buildingService'; // Импорт API функции

type Building = {
  id: number | string | undefined;
  name?: string;
  address?: string;
  height: number;
  width?: number;
  type?: string;
};

const MAPTILER_KEY = "XFChCzquRRUPCbyR0Ytt";

const MapComponent = () => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [highlightedBuildingId, setHighlightedBuildingId] = useState<string | number | undefined>(undefined);
  const [isLayerReady, setIsLayerReady] = useState(false);

  useEffect(() => {
    try {
      const map = new maplibregl.Map({
        container: 'map',
        style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
        center: [76.889709, 43.238949], // Центр на Алматы
        zoom: 15,
      });

      mapRef.current = map;

      map.on('load', () => {
        console.log("Карта успешно загружена");

        const layerId = 'Building 3D';

        if (map.getLayer(layerId)) {
          setIsLayerReady(true); // Помечаем слой как готовый
        } else {
          console.error(`Слой '${layerId}' не найден.`);
        }
      });

      window.addEventListener('resize', () => {
        map.resize();
      });

      return () => {
        map.remove();
        window.removeEventListener('resize', () => {
          map.resize();
        });
      };
    } catch (error) {
      console.error("Ошибка при инициализации карты:", error);
    }
  }, []);

  const handleMapClick = async (e: maplibregl.MapMouseEvent) => {
    if (!isLayerReady || !mapRef.current) {
      console.log("Слой или карта еще не готовы для обработки кликов.");
      return;
    }

    const map = mapRef.current;
    const layerId = 'Building 3D';
    const features = map.queryRenderedFeatures(e.point, {
      layers: [layerId],
      radius: 5,
    });

    if (features.length) {
      const feature = features[0];

      // Получение координат здания
      let lat, lon;
      if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
        [lon, lat] = feature.geometry.coordinates[0][0];
      } else if (feature.geometry.type === "Point") {
        [lon, lat] = feature.geometry.coordinates;
      } else {
        console.error("Неизвестный тип геометрии:", feature.geometry.type);
        return;
      }

      try {
        // Запрос данных о здании через Nominatim API
        const buildingData = await fetchBuildingData(lat, lon);

        setSelectedBuilding({
          id: feature.id,
          name: buildingData.name || "Без названия",
          address: buildingData.address || "Адрес неизвестен",
          height: feature.properties.render_height || 0, // Используем данные из feature.properties
          width: feature.properties.render_width || 0,   // Если доступна ширина
          type: buildingData.type || "Тип неизвестен",
        });

        setHighlightedBuildingId(feature.id);

        map.setFeatureState(
          { source: feature.source, sourceLayer: feature.sourceLayer, id: feature.id },
          { highlight: true }
        );

        map.setPaintProperty(layerId, 'fill-extrusion-color', [
          'case',
          ['boolean', ['feature-state', 'highlight'], false], '#ff0000',
          '#aaa'
        ]);

        console.log("Здание выбрано для отображения:", buildingData);
      } catch (error) {
        console.error("Ошибка при получении данных о здании:", error);
      }
    } else {
      console.log("Здание не найдено.");
    }
  };

  useEffect(() => {
    if (isLayerReady && mapRef.current) {
      const map = mapRef.current;
      map.on('click', handleMapClick);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
      }
    };
  }, [isLayerReady]);

  const closeFeatureInfo = () => {
    setSelectedBuilding(null);
    if (highlightedBuildingId && mapRef.current) {
      mapRef.current.setFeatureState(
        { source: 'composite', sourceLayer: 'building', id: highlightedBuildingId },
        { highlight: false }
      );
      setHighlightedBuildingId(undefined);
    }
  };

  return (
    <div className="relative h-screen w-screen">
      <div id="map" className="h-full w-full" />

      {selectedBuilding && (
        <div className="absolute bottom-4 left-4 right-4 p-4 bg-white shadow-lg rounded-lg z-50 border-2 border-black">
          <FeatureInfo building={selectedBuilding} onClose={closeFeatureInfo} />
        </div>
      )}
    </div>
  );
};

export default MapComponent;
