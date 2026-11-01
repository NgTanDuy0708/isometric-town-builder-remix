export const EXTRACTION_WORKSHOPS = {
  b69_forester_lodge:{name:'Trạm kiểm lâm',resource:'ancientWood',node:'n04_ancient_grove',icon:'🌳'},
  b11_carpenter_sawmill: { name: 'Xưởng khai thác gỗ', resource: 'wood', node: 'n01_logging_grove', icon: '🪵' },
  b65_stone_quarry: { name: 'Xưởng khai thác đá', resource: 'stone', node: 'n02_stone_deposit', icon: '🪨' },
  b66_iron_mine: { name: 'Mỏ sắt', resource: 'ironOre', node: 'n03_iron_deposit', icon: '⛏️' }
};
export const EXTRACTION_NODES = {
  n04_ancient_grove:{resource:'ancientWood',name:'Cây cổ thụ',icon:'🌳',capacity:15,recoverySeconds:120},
  n01_logging_grove: { resource: 'wood', name: 'Rừng khai thác', icon: '🪵', capacity: 30, recoverySeconds: 60 },
  n02_stone_deposit: { resource: 'stone', name: 'Bãi đá khai thác', icon: '🪨', capacity: 30, recoverySeconds: 60 },
  n03_iron_deposit: { resource: 'ironOre', name: 'Mạch quặng sắt', icon: '⛏️', capacity: 30, recoverySeconds: 60 }
};
export const WORKER_HIRE_GOLD = 30;
export const WORK_SECONDS = 6;
export const WORKER_LOAD = 2;
export const getWorkerSlots = level => Math.min(4, Math.max(2, Math.floor(Number(level) || 1) + 1));
export function countExtractionWorkers(grid, extraction = {}) {
  return (Array.isArray(extraction?.jobs) ? extraction.jobs : []).filter(job =>
    job && EXTRACTION_WORKSHOPS[grid[job.homeRow]?.[job.homeCol]] &&
    grid[job.homeRow][job.homeCol] === job.tileId).length;
}
