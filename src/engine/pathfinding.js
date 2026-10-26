// A* Pathfinding and Road Network Analysis for Isometric Town Grid (16x16)

/**
 * Heuristic Manhattan distance between two cells
 */
function heuristic(r1, c1, r2, c2) {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

/**
 * Check if cell (r, c) is within grid bounds
 */
export function isInBounds(r, c, rows = 32, cols = 32) {
  return r >= 0 && r < rows && c >= 0 && c < cols;
}

/**
 * Find adjacent road cells around a given building cell
 */
export function findAdjacentRoadCells(grid, centerRow, centerCol, isWalkableRoadFn) {
  const neighbors = [
    { r: centerRow - 1, c: centerCol },
    { r: centerRow + 1, c: centerCol },
    { r: centerRow, c: centerCol - 1 },
    { r: centerRow, c: centerCol + 1 }
  ];
  return neighbors.filter(n => isInBounds(n.r, n.c, grid.length, grid[0].length) && isWalkableRoadFn(n.r, n.c));
}

/**
 * Standard A* search algorithm to find the shortest walkable path on the road network
 * @param {Array<Array<string>>} grid - 2D tile id grid
 * @param {{ r: number, c: number }} start - Starting coordinate
 * @param {{ r: number, c: number }} goal - Destination coordinate
 * @param {(r: number, c: number) => boolean} isWalkableFn - Callback to test whether cell is walkable
 * @returns {Array<{ r: number, c: number }> | null} Array of waypoints including start and goal, or null
 */
export function findPathAStar(grid, start, goal, isWalkableFn) {
  const rows = grid.length;
  const cols = grid[0].length;

  if (!isInBounds(start.r, start.c, rows, cols) || !isInBounds(goal.r, goal.c, rows, cols)) {
    return null;
  }

  if (start.r === goal.r && start.c === goal.c) {
    return [{ r: start.r, c: start.c }];
  }

  const startKey = `${start.r}_${start.c}`;
  const goalKey = `${goal.r}_${goal.c}`;

  // Priority queue for open set
  const openSet = [{ r: start.r, c: start.c, f: heuristic(start.r, start.c, goal.r, goal.c) }];
  const cameFrom = new Map();

  const gScore = new Map();
  gScore.set(startKey, 0);

  const fScore = new Map();
  fScore.set(startKey, heuristic(start.r, start.c, goal.r, goal.c));

  const closedSet = new Set();

  while (openSet.length > 0) {
    // Pick node with lowest fScore
    let lowestIdx = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIdx].f) {
        lowestIdx = i;
      }
    }
    const current = openSet.splice(lowestIdx, 1)[0];
    const currentKey = `${current.r}_${current.c}`;

    if (current.r === goal.r && current.c === goal.c) {
      // Reconstruct path
      const path = [{ r: current.r, c: current.c }];
      let currKey = currentKey;
      while (cameFrom.has(currKey)) {
        const prev = cameFrom.get(currKey);
        path.unshift({ r: prev.r, c: prev.c });
        currKey = `${prev.r}_${prev.c}`;
      }
      return path;
    }

    closedSet.add(currentKey);

    const neighbors = [
      { r: current.r - 1, c: current.c },
      { r: current.r + 1, c: current.c },
      { r: current.r, c: current.c - 1 },
      { r: current.r, c: current.c + 1 }
    ];

    for (const neighbor of neighbors) {
      if (!isInBounds(neighbor.r, neighbor.c, rows, cols)) continue;
      const neighborKey = `${neighbor.r}_${neighbor.c}`;
      if (closedSet.has(neighborKey)) continue;

      // Cell must be walkable, or it is the exact goal
      const isGoal = neighbor.r === goal.r && neighbor.c === goal.c;
      if (!isGoal && !isWalkableFn(neighbor.r, neighbor.c)) {
        continue;
      }

      const tentativeG = gScore.get(currentKey) + 1;
      const prevG = gScore.has(neighborKey) ? gScore.get(neighborKey) : Infinity;

      if (tentativeG < prevG) {
        cameFrom.set(neighborKey, { r: current.r, c: current.c });
        gScore.set(neighborKey, tentativeG);
        const f = tentativeG + heuristic(neighbor.r, neighbor.c, goal.r, goal.c);
        fScore.set(neighborKey, f);

        const inOpen = openSet.find(n => n.r === neighbor.r && n.c === neighbor.c);
        if (!inOpen) {
          openSet.push({ r: neighbor.r, c: neighbor.c, f });
        } else {
          inOpen.f = f;
        }
      }
    }
  }

  return null; // No path found
}

/**
 * Get all walkable road cells on unlocked land
 */
export function getAllWalkableRoads(grid, isWalkableRoadFn) {
  const roadCells = [];
  const rows = grid.length;
  const cols = grid[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (isWalkableRoadFn(r, c)) {
        roadCells.push({ r, c });
      }
    }
  }
  return roadCells;
}

/**
 * Pick a connected random road walk starting from a given road cell
 */
export function getRandomConnectedRoadCell(grid, startCell, isWalkableRoadFn, maxTries = 10) {
  const allRoads = getAllWalkableRoads(grid, isWalkableRoadFn);
  if (allRoads.length === 0) return null;

  // Shuffle and try to find one reachable via A*
  for (let i = 0; i < maxTries; i++) {
    const candidate = allRoads[Math.floor(Math.random() * allRoads.length)];
    if (candidate.r === startCell.r && candidate.c === startCell.c) continue;
    const path = findPathAStar(grid, startCell, candidate, isWalkableRoadFn);
    if (path && path.length > 1) {
      return { destination: candidate, path };
    }
  }

  return null;
}
