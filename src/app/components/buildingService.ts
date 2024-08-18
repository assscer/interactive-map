export const fetchBuildingData = async (lat: number, lon: number) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);

    if (!response.ok) {
      throw new Error('Failed to fetch building data');
    }

    const data = await response.json();

    if (!data || !data.address) {
      return {
        name: 'Неизвестное здание',
        address: 'Адрес не найден',
        type: 'Тип неизвестен',
        height: 0,
        width: 0,
      };
    }

    return {
      name: data.name || (data.address && data.address.building) || 'Неизвестное здание',
      address: data.display_name || 'Адрес не найден',
      type: data.type || 'Тип неизвестен',
      height: 0,
      width: 0,
    };
  } catch (error) {
    console.error("Ошибка при запросе данных о здании:", error);
    return {
      name: 'Неизвестное здание',
      address: 'Адрес не найден',
      type: 'Тип неизвестен',
      height: 0,
      width: 0,
    };
  }
};
