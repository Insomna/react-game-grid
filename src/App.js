import React, { useState, useEffect } from 'react';
import './App.css';
import { generateMap } from './utils/worldGeneration';  // Импортируем функцию генерации карты
import { saveMapToLocalStorage, loadMapFromLocalStorage } from './utils/localStorage';  // Импортируем утилиты работы с localStorage

const Cell = ({ type, x, y, isPlayer, isHighlighted, onClick }) => {
  const colors = {
    0: 'water',  // Вода
    1: 'ground', // Земля
    2: 'tree', // Дерево
  };

  return (
    <div
      onClick={() => onClick(x, y)}  // Обработчик клика
      className={colors[type]}
      style={{
        width: '64px',
        height: '64px',
        filter: isHighlighted ? 'grayscale(1)' : 'none',
        // backgroundColor: colors[type] || 'white',
        // border: isPlayer ? '3px solid transparent' : (isHighlighted ? '3px solid gray' : '3px solid transparent'),  // Подсветка пути серым
        display: 'inline-block',
      }}
    >
    </div>
  );
};

// Функция для подсчета стоимости пути
const getMoveCost = (cellType) => {
  if (cellType === 0) return 0;  // Вода — не проходимая клетка
  if (cellType === 2) return 5;  // Дерево — препятствие (большая стоимость)
  return 1;  // Земля — стандартная стоимость
};

// Алгоритм BFS для поиска кратчайшего пути
const bfs = (map, start, end) => {
  const queue = [[start]];  // Массив, хранящий путь
  const visited = new Set();  // Множество посещенных клеток
  visited.add(`${start.x},${start.y}`);

  const directions = [
    { x: 0, y: -1 },  // Вверх
    { x: 0, y: 1 },   // Вниз
    { x: -1, y: 0 },  // Влево
    { x: 1, y: 0 },   // Вправо
  ];

  while (queue.length > 0) {
    const path = queue.shift();
    const { x, y } = path[path.length - 1];  // Текущая клетка

    if (x === end.x && y === end.y) {
      return path;  // Мы достигли целевой клетки, возвращаем путь
    }

    for (const { x: dx, y: dy } of directions) {
      const newX = x + dx;
      const newY = y + dy;

      // Ограничиваем движение на клетки с водой (тип 0) и деревьями (тип 2)
      if (
        newX >= 0 && newX < map[0].length && newY >= 0 && newY < map.length && 
        !visited.has(`${newX},${newY}`) && map[newY][newX] !== 0 && map[newY][newX] !== 2
      ) {
        visited.add(`${newX},${newY}`);
        const newPath = [...path, { x: newX, y: newY }];
        queue.push(newPath);
      }
    }
  }

  return [];  // Если путь не найден
};

const App = () => {
  const [map, setMap] = useState([]);
  const [player, setPlayer] = useState({ x: 0, y: 0 });  // Начальная позиция игрока
  const [steps, setSteps] = useState(0);  // Счётчик шагов
  const [highlightedPath, setHighlightedPath] = useState([]);  // Путь для подсветки
  const [lastClickedCell, setLastClickedCell] = useState(null);  // Храним последнюю выбранную клетку
  const [treeDensity, setTreeDensity] = useState(0.15);  // Процент деревьев на клетках земли (по умолчанию 20%)
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [moving, setMoving] = useState(false); 
  const [direction, setDirection] = useState('');


  // Загружаем карту из localStorage или генерируем новую, если карта не найдена
  useEffect(() => {
    let loadedMap = loadMapFromLocalStorage();  // Загружаем карту из localStorage
    loadedMap = null
    if (!loadedMap) {
      // Если карта не найдена, генерируем новую
      loadedMap = generateMap(100, 100, 0.65);  // Размер 150x150, порог земли 0.63
      // Добавление деревьев на клетки с землёй
      for (let y = 0; y < loadedMap.length; y++) {
        for (let x = 0; x < loadedMap[y].length; x++) {
          if (loadedMap[y][x] === 1) {  // Если клетка — это земля
            if (Math.random() < treeDensity) {
              loadedMap[y][x] = 2;  // Ставим дерево
            }
          }
        }
      }
      saveMapToLocalStorage(loadedMap);  // Сохраняем сгенерированную карту в localStorage
    }

    // Находим первую клетку с землёй (1) для установки начальной позиции игрока
    // Определяем центр карты
const centerX = Math.floor(loadedMap[0].length / 2);
const centerY = Math.floor(loadedMap.length / 2);

// BFS для поиска ближайшей клетки с землёй (1)
const findNearestLand = (startX, startY) => {
  const queue = [{ x: startX, y: startY }];
  const visited = new Set();
  visited.add(`${startX},${startY}`);

  const directions = [
    { x: 0, y: -1 },  // Вверх
    { x: 0, y: 1 },   // Вниз
    { x: -1, y: 0 },  // Влево
    { x: 1, y: 0 },   // Вправо
  ];

  while (queue.length > 0) {
    const { x, y } = queue.shift();

    // Если нашли клетку с землёй, возвращаем её координаты
    if (loadedMap[y][x] === 1) return { x, y };

    for (const { x: dx, y: dy } of directions) {
      const newX = x + dx;
      const newY = y + dy;
      const key = `${newX},${newY}`;

      if (
        newX >= 0 && newX < loadedMap[0].length &&
        newY >= 0 && newY < loadedMap.length &&
        !visited.has(key)
      ) {
        visited.add(key);
        queue.push({ x: newX, y: newY });
      }
    }
  }

  return { x: 0, y: 0 };  // Если вдруг нет земли (что маловероятно)
};

// Найти ближайшую клетку к центру
const initialPlayerPosition = findNearestLand(centerX, centerY);


    setMap(loadedMap);  // Устанавливаем карту в состояние
    setPlayer(initialPlayerPosition);  // Устанавливаем начальную позицию игрока
    updateOffset(initialPlayerPosition.x, initialPlayerPosition.y); // смещаем камеру
  }, [treeDensity]);

  // Функция для перемещения игрока
  const movePlayer = (x, y) => {
    if (x === player.x && y === player.y) return;  // Если кликнули на текущую позицию игрока, ничего не делаем

    // Проверка, не является ли клетка водой или деревом
    if (map[y][x] === 0 || map[y][x] === 2) {
      alert('Нельзя перемещаться в воду или через дерево!');
      return;  // Прекращаем выполнение, если клетка — это вода или дерево
    }

    if (lastClickedCell && lastClickedCell.x === x && lastClickedCell.y === y) {
      // Если мы кликаем на ту же клетку, что и в последний раз, перемещаем игрока
      const path = bfs(map, player, { x, y });

      if (path.length > 0) {
        let totalSteps = 0;
        path.forEach(({ x, y }) => {
          totalSteps += getMoveCost(map[y][x]);
        });
    
        setSteps(steps + totalSteps);
        setHighlightedPath([]);  
        setLastClickedCell(null);
    
        animateMovement(path); 
      }
    } else {
      // Если кликнули на другую клетку, показываем путь к новой цели
      const path = bfs(map, player, { x, y });

      if (path.length > 0) {
        setHighlightedPath(path);  // Показываем путь
        setSteps(0);  // Сбросить счетчик шагов, пока не выбрали путь
        setLastClickedCell({ x, y });  // Сохраняем клетку, на которую кликнули
      } else {
        setHighlightedPath([]);  // Если пути нет, очистить подсветку
      }
    }
  };

  //Смещение камеры
  const updateOffset = (playerX, playerY) => {
    const centerX = window.innerWidth / 2 - 32; // Центр экрана по X (с учетом размера клетки)
    const centerY = window.innerHeight / 2 - 32; // Центр экрана по Y
  
    setOffset({
      x: centerX - playerX * 64,
      y: centerY - playerY * 64
    });
  };

  const animateMovement = (path) => {
    setMoving(true);
    let stepIndex = 0;
  
    const moveStep = () => {
      if (stepIndex < path.length) {
        const prev = path[stepIndex - 1] || path[stepIndex]; 
        const { x, y } = path[stepIndex];
        // Определяем направление
        if (x > prev.x) setDirection('right');
        else if (x < prev.x) setDirection('left');
        else if (y > prev.y) setDirection('down');
        else if (y < prev.y) setDirection('top');

        setPlayer({ x, y });   // Перемещаем игрока
        updateOffset(x, y);     // Двигаем карту
        stepIndex++;
  
        setTimeout(moveStep, 200);  // Задержка между шагами (100ms, можно менять)
      } else {
        // setDirection('');
        setMoving(false);
      }
    };
  
    moveStep();
  };
  

  return (
    <div className={`camera ${direction}`} style={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden', 
      position: 'relative' 
    }}>
      <h3>Карта мира</h3>
      <p>Шаги: {steps}</p>
      <div 
        className='map'
        style={{ 
          top: 0,
          left: 0,
          position: 'absolute', 
          transform: `translate(${offset.x}px, ${offset.y}px)`, 
          display: 'grid', 
          gridTemplateColumns: `repeat(100, 64px)`, 
          transition: 'transform .2s linear' ,
        }}
      >    
        {map.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              type={cell}
              x={colIndex}
              y={rowIndex}
              isPlayer={player.x === colIndex && player.y === rowIndex}  // Проверяем, находит ли игрок на этой ячейке
              isHighlighted={highlightedPath.some((p) => p.x === colIndex && p.y === rowIndex)}  // Подсветка пути
              onClick={movePlayer}  // Передаем функцию для перемещения
            />
          ))
        )}
      </div>
    </div>
  );
};

export default App;
