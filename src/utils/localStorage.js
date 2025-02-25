// src/utils/localStorage.js
export const saveMapToLocalStorage = (map) => {
    localStorage.setItem('gameMap', JSON.stringify(map));  // Сохраняем карту в виде строки JSON
  };
  
  // Загрузка карты из localStorage
  export const loadMapFromLocalStorage = () => {
    const savedMap = localStorage.getItem('gameMap');  // Пытаемся получить карту из localStorage
    if (savedMap) {
      return JSON.parse(savedMap);  // Если карта есть, парсим её и возвращаем
    }
    return null;  // Если карты нет, возвращаем null
  };