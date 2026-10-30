import {RESOURCE_ICON_URIS} from './resourceIcons.js';
// File-backed icons are shared by crop menus, warehouse, market and harvest UI.
export const CROP_PIXEL_SPRITES = Object.fromEntries(Object.entries(RESOURCE_ICON_URIS).map(([id,uri])=>['icon_'+id,uri]));
