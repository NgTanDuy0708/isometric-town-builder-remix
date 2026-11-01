// Active region only. Save data remains the source of truth when regions change.
let activeLocks = {};
let customLayout=false;
export function setCustomMapLayout(value){customLayout=value===true;}
export function isCustomMapLayout(){return customLayout;}
export function normalizeMapLocks(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key,locked]) =>
    /^(?:[0-9]|[12][0-9]|3[01])_(?:[0-9]|[12][0-9]|3[01])$/.test(key) && typeof locked === 'boolean'));
}
export function setActiveMapLocks(value) { activeLocks = normalizeMapLocks(value); }
export function isMapLockedCell(row,col) { return activeLocks[`${row}_${col}`] === true; }
export function isMapRemovableCell(row,col) { return activeLocks[`${row}_${col}`] === false; }
