import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {getDefaultSaveState} from '../src/engine/storage.js';
import {createMapDocument} from '../src/engine/mapEditing.js';
import {MAP_ITEMS} from '../src/engine/mapEditing.js';

test('the real editor screen exposes full catalog, port/ship/gate shortcuts, rotation and both removal options',async()=>{
  globalThis.Image=class{complete=true;naturalWidth=1254;naturalHeight=1254;src='';};
  const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
  const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false,watch:null},appType:'custom'});
  let markup;
  try{const module=await server.ssrLoadModule('/src/MapEditor.tsx');markup=renderToStaticMarkup(React.createElement(module.default));}
  finally{await server.close();}
  for(const label of ['Cổng thành','Cảng biển','Tàu biển','Xoay vật phẩm','Mặc định (không thể gỡ)','Có thể gỡ','Lưu map khởi đầu','Tìm vật phẩm','Nhóm vật phẩm'])assert.ok(markup.includes(label),label);
  assert.match(markup,/>R<\/kbd>/);assert.match(markup,/scene:ship|TauHoangGia/);
  assert.equal((markup.match(/class="me-item /g)||[]).length,MAP_ITEMS.length);
  assert.ok(createMapDocument(getDefaultSaveState()).mapScenery['14_4']);
});
