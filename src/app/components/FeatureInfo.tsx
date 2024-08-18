import React from 'react';

type FeatureInfoProps = {
  building: {
    name?: string;
    address?: string;
    height: number;
    width?: number;
    type?: string;
  } | null;
  onClose: () => void;
};

const FeatureInfo: React.FC<FeatureInfoProps> = ({ building, onClose }) => {
  if (!building) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-full border border-gray-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {building.name || 'Здание без названия'}
        </h2>
        <button onClick={onClose} className="text-red-500">
          Закрыть
        </button>
      </div>
      <p><strong>Тип:</strong> {building.type || 'Тип неизвестен'}</p>
      <p><strong>Адрес:</strong> {building.address || 'Адрес не найден'}</p>
      <p><strong>Высота:</strong> {building.height} м</p>
      {building.width !== undefined && (
        <p><strong>Ширина:</strong> {building.width} м</p>
      )}
    </div>
  );
};

export default FeatureInfo;
