import bundledMap from '../data/village-initial-map-32x32.json' with {type:'json'};
import {STARTER_MAP_KEY,readMapDocument,writeMapDocument} from './mapEditing.js';

// This document is part of the build, so every origin starts with the same map.
function mapRevision(doc){
  const text=JSON.stringify(doc);let hash=2166136261;
  for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619);
  return 'bundled-map-v1-'+(hash>>>0).toString(16);
}
export const BUNDLED_STARTER_MAP_REVISION=mapRevision(bundledMap);
export const STARTER_MAP_REVISION_KEY=STARTER_MAP_KEY+'_revision';
export function createBundledStarterMap(){return structuredClone(bundledMap);}

export function getStarterMapDocument(storage){
  try{
    // A browser-only override is intentional only if saved against this release.
    // Older overrides stay available in the editor, but cannot mask a new map.
    if(storage.getItem(STARTER_MAP_REVISION_KEY)===BUNDLED_STARTER_MAP_REVISION){
      const local=readMapDocument(storage,STARTER_MAP_KEY);if(local)return local;
    }
  }catch{/* A blocked/full browser store does not prevent using the bundled map. */}
  return createBundledStarterMap();
}
export function saveLocalStarterMap(storage,doc){
  writeMapDocument(storage,STARTER_MAP_KEY,doc);
  storage.setItem(STARTER_MAP_REVISION_KEY,BUNDLED_STARTER_MAP_REVISION);
}
