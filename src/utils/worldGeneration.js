// src/utils/worldGeneration.js

// Генерация карты земли и воды с использованием клеточного автомата
export const generateMap = (width, height, landThreshold) => {
    let map = Array.from({ length: height }, () => Array(width).fill(0));
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        map[y][x] = Math.random() < landThreshold ? 1 : 0;
      }
    }
  
    const iterations = 4;
    for (let i = 0; i < iterations; i++) {
      map = cellularAutomaton(map); // Теперь map обновляется, но не переназначается
    }
  
    return map;
  };
  
  
  const cellularAutomaton = (map) => {
    const height = map.length;
    const width = map[0].length;
  
    // Создаём новый массив, чтобы не переназначать const переменную
    const newMap = map.map(row => row.slice());  // Копируем содержимое map в новый массив
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let landNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dy === 0 && dx === 0) continue;
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              landNeighbors += map[ny][nx];
            }
          }
        }
        if (landNeighbors >= 5) {
          newMap[y][x] = 1;  // Обновляем значения в новом массиве
        } else {
          newMap[y][x] = 0;
        }
      }
    }
  
    return newMap;  // Возвращаем новый массив, а не модифицируем существующий
  };
  
  
  export const findIslands = (map) => {
    const visited = Array.from({ length: map.length }, () => Array(map[0].length).fill(false));
    const islands = [];
  
    const dfs = (x, y, island) => {
      if (x < 0 || y < 0 || x >= map[0].length || y >= map.length || visited[y][x] || map[y][x] === 0) {
        return;
      }
      visited[y][x] = true;
      island.push({ x, y });
  
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (const [dx, dy] of directions) {
        dfs(x + dx, y + dy, island);
      }
    };
  
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[0].length; x++) {
        if (map[y][x] === 1 && !visited[y][x]) {
          const island = [];
          dfs(x, y, island);
          islands.push(island);
        }
      }
    }
  
    return islands;
  };
  
  export const generatePathsBetweenIslands = (map, islands, pathChance) => {
    const numIslands = islands.length;
    const pathMap = map.map(row => row.slice());
  
    const connectIslands = (island1, island2) => {
      const start = island1[Math.floor(Math.random() * island1.length)];
      const end = island2[Math.floor(Math.random() * island2.length)];
  
      const path = findPath(start, end);
      path.forEach(({ x, y }) => {
        pathMap[y][x] = 1;
      });
    };
  
    for (let i = 0; i < numIslands; i++) {
      for (let j = i + 1; j < numIslands; j++) {
        if (Math.random() < pathChance) {
          connectIslands(islands[i], islands[j]);
        }
      }
    }
  
    return pathMap;
  };
  
  const findPath = (start, end) => {
    const path = [];
    let { x, y } = start;
  
    while (x !== end.x || y !== end.y) {
      if (x < end.x) x++;
      if (x > end.x) x--;
      if (y < end.y) y++;
      if (y > end.y) y--;
  
      path.push({ x, y });
    }
  
    return path;
  };
  