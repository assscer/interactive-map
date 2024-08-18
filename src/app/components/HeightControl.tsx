import React from 'react';

const HeightControl = ({ onIncrease, onDecrease }: { onIncrease: () => void; onDecrease: () => void; }) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col space-y-2 z-50">
      <button onClick={onIncrease} className="px-4 py-2 bg-blue-500 text-white rounded">
        Увеличить высоту
      </button>
      <button onClick={onDecrease} className="px-4 py-2 bg-red-500 text-white rounded">
        Уменьшить высоту
      </button>
    </div>
  );
};

export default HeightControl;
