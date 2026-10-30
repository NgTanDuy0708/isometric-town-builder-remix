export const ROAD_TILE_SIZE = 64;
export const ROAD_WIDTH = ROAD_TILE_SIZE * 0.6;
const H = ROAD_WIDTH / 2, R = ROAD_TILE_SIZE / 2;
const directions = ['N', 'E', 'S', 'W'];
const geometryCache = new Map();
export const ROAD_SHAPES = {
  r01_road_straight_ns: { exits: ['N', 'S'], turns: 0 },
  r02_road_straight_ew: { exits: ['N', 'S'], turns: 1 },
  r03_road_cross: { exits: ['N', 'E', 'S', 'W'], turns: 0 },
  r04_road_tee_nes: { exits: ['N', 'E', 'S'], turns: 0 },
  r07_road_tee_ews: { exits: ['N', 'E', 'S'], turns: 1 },
  r05_road_tee_nsw: { exits: ['N', 'E', 'S'], turns: 2 },
  r06_road_tee_ewn: { exits: ['N', 'E', 'S'], turns: 3 },
  r08_road_corner_ne: { exits: ['N', 'E'], turns: 0 },
  r09_road_corner_es: { exits: ['N', 'E'], turns: 1 },
  r10_road_corner_sw: { exits: ['N', 'E'], turns: 2 },
  r11_road_corner_wn: { exits: ['N', 'E'], turns: 3 }
};

export function getExpansionRoadConnections(id, flipped = false) {
  const shape = Object.hasOwn(ROAD_SHAPES, id) ? ROAD_SHAPES[id] : undefined;
  if (!shape) return undefined;
  const mirror = { N: 'W', E: 'S', S: 'E', W: 'N' };
  return shape.exits.map(exit => {
    const direction = directions[(directions.indexOf(exit) + shape.turns) % 4];
    return flipped ? mirror[direction] : direction;
  });
}

// Union of equal-width corridors. Removing shared edges produces one simple
// outline, so corners cannot bulge or develop different connector widths.
export function getRoadGeometry(id, flipped = false) {
  const cacheKey=id+'/'+flipped;
  if(geometryCache.has(cacheKey))return geometryCache.get(cacheKey);
  const exits = getExpansionRoadConnections(id, flipped);
  if (!exits) return undefined;
  const positions = [-R, -H, H, R];
  const cells = [[1, 1], ...exits.map(e => ({N:[1,0],E:[2,1],S:[1,2],W:[0,1]})[e])];
  const edges = new Map();
  const key = p => p.join(',');
  for (const [x,y] of cells) {
    const corners = [[positions[x],positions[y]], [positions[x+1],positions[y]],
      [positions[x+1],positions[y+1]], [positions[x],positions[y+1]]];
    corners.forEach((start,i) => {
      const end=corners[(i+1)%4], reverse=key(end)+'/'+key(start);
      if (edges.has(reverse)) edges.delete(reverse);
      else edges.set(key(start)+'/'+key(end), { start, end });
    });
  }
  const remaining=[...edges.values()], polygon=[];
  let edge=remaining.shift();
  while(edge) {
    polygon.push(edge.start);
    const next=remaining.findIndex(e=>key(e.start)===key(edge.end));
    edge=next<0?undefined:remaining.splice(next,1)[0];
  }
  const connectors=[], borders=[];
  polygon.forEach((start,i)=>{
    const end=polygon[(i+1)%polygon.length];
    const direction=start[1]===-R&&end[1]===-R?'N':start[0]===R&&end[0]===R?'E'
      :start[1]===R&&end[1]===R?'S':start[0]===-R&&end[0]===-R?'W':null;
    (direction?connectors:borders).push({start,end,...(direction?{direction}:{})});
  });
  const geometry={ polygon, borders, connectors, width:ROAD_WIDTH };
  geometryCache.set(cacheKey,geometry);
  return geometry;
}
