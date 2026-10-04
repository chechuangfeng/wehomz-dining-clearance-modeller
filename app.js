'use strict';

const CM_PER_INCH = 2.54;
const DEFAULTS = Object.freeze({roomWidth:460,roomDepth:360,tableWidth:180,tableDepth:90,offsetLeft:140,offsetTop:120,extentLeft:55,extentRight:55,extentTop:50,extentBottom:50});
const LABELS = Object.freeze({roomWidth:'Room width',roomDepth:'Room depth',tableWidth:'Table width',tableDepth:'Table depth',offsetLeft:'From left boundary',offsetTop:'From top boundary',extentLeft:'Left chair extent',extentRight:'Right chair extent',extentTop:'Top chair extent',extentBottom:'Bottom chair extent'});
const SIDES = ['left','right','top','bottom'];
const POSITIVE_FIELDS = new Set(['roomWidth','roomDepth','tableWidth','tableDepth']);

function toCm(value, unit) { return unit === 'in' ? value * CM_PER_INCH : value; }
function fromCm(value, unit) { return unit === 'in' ? value / CM_PER_INCH : value; }
function displayNumber(value) { return Number(value.toFixed(3)).toLocaleString('en-US', {maximumFractionDigits:3}); }
function inputNumber(value) {
  const rounded = Number(value.toFixed(3));
  return String(rounded === 0 && value !== 0 ? value : rounded);
}
function computeModel(m) {
  const remaining = {left:m.offsetLeft-m.extentLeft,right:m.roomWidth-m.offsetLeft-m.tableWidth-m.extentRight,top:m.offsetTop-m.extentTop,bottom:m.roomDepth-m.offsetTop-m.tableDepth-m.extentBottom};
  const envelope = {x:m.offsetLeft-m.extentLeft,y:m.offsetTop-m.extentTop,width:m.tableWidth+m.extentLeft+m.extentRight,height:m.tableDepth+m.extentTop+m.extentBottom};
  return {remaining,envelope,crossing:SIDES.filter(side => remaining[side] < -1e-9)};
}

function drawingBounds(m, e) {
  const minX = Math.min(0,e.x), minY = Math.min(0,e.y);
  const maxX = Math.max(m.roomWidth,e.x+e.width), maxY = Math.max(m.roomDepth,e.y+e.height);
  const spanX = maxX-minX, spanY = maxY-minY;
  const scale = Math.min(680/spanX,480/spanY);
  return {spanX,spanY,scale,originX:450-spanX*scale/2-minX*scale,originY:350-spanY*scale/2-minY*scale};
}

const form = document.getElementById('model-form');
const unitControl = document.getElementById('unit');
const measuredControl = document.getElementById('measured');
const svg = document.getElementById('diagram');
const svgContent = document.getElementById('diagram-content');
const fields = Object.fromEntries(Object.keys(DEFAULTS).map(key => [key, document.getElementById(key)]));
const values = {...DEFAULTS};
let unit = 'cm';
let modelIsValid = true;

function validateField(key) {
  const input = fields[key];
  const value = input.valueAsNumber;
  const minimumValid = POSITIVE_FIELDS.has(key) ? value > 0 : value >= 0;
  const valid = input.value.trim() !== '' && Number.isFinite(value) && minimumValid && Number.isFinite(toCm(value,unit));
  input.setAttribute('aria-invalid', String(!valid));
  document.getElementById(`${key}-error`).textContent = valid ? '' : POSITIVE_FIELDS.has(key) ? 'Enter a number greater than 0.' : 'Enter 0 or a positive number.';
  return valid;
}

function svgNode(tag, attrs, text) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([key,value]) => node.setAttribute(key,String(value)));
  if (text !== undefined) node.textContent = text;
  svgContent.appendChild(node);
  return node;
}

function drawModel(result) {
  svgContent.replaceChildren();
  const m = values;
  const e = result.envelope;
  const {scale,originX,originY} = drawingBounds(m,e);
  const x = value => originX+value*scale;
  const y = value => originY+value*scale;
  const textValue = value => `${displayNumber(fromCm(value,unit))} ${unit}`;
  svgNode('rect',{x:x(0),y:y(0),width:m.roomWidth*scale,height:m.roomDepth*scale,class:'room-shape'});
  svgNode('rect',{x:x(e.x),y:y(e.y),width:e.width*scale,height:e.height*scale,class:'extent-shape'});
  svgNode('rect',{x:x(m.offsetLeft),y:y(m.offsetTop),width:m.tableWidth*scale,height:m.tableDepth*scale,rx:3,class:'table-shape'});
  if (m.tableWidth*scale > 85 && m.tableDepth*scale > 35) svgNode('text',{x:x(m.offsetLeft+m.tableWidth/2),y:y(m.offsetTop+m.tableDepth/2)+4,'text-anchor':'middle',class:'svg-table-label'},'TABLE');

  const topLabelY = Math.max(28,y(0)-28), bottomLabelY = Math.min(674,y(m.roomDepth)+36);
  svgNode('text',{x:x(m.roomWidth/2),y:topLabelY,'text-anchor':'middle',class:'svg-side-label'},'TOP');
  svgNode('text',{x:x(m.roomWidth/2),y:bottomLabelY,'text-anchor':'middle',class:'svg-side-label'},'BOTTOM');
  svgNode('text',{x:Math.max(28,x(0)-28),y:y(m.roomDepth/2),'text-anchor':'middle',transform:`rotate(-90 ${Math.max(28,x(0)-28)} ${y(m.roomDepth/2)})`,class:'svg-side-label'},'LEFT');
  svgNode('text',{x:Math.min(872,x(m.roomWidth)+30),y:y(m.roomDepth/2),'text-anchor':'middle',transform:`rotate(90 ${Math.min(872,x(m.roomWidth)+30)} ${y(m.roomDepth/2)})`,class:'svg-side-label'},'RIGHT');
  svgNode('text',{x:x(m.roomWidth/2),y:Math.max(12,topLabelY-18),'text-anchor':'middle',class:'svg-label'},`Room width ${textValue(m.roomWidth)}`);
  svgNode('text',{x:x(m.roomWidth/2),y:Math.min(695,bottomLabelY+20),'text-anchor':'middle',class:'svg-label'},`Room depth ${textValue(m.roomDepth)}`);

  const middleX = m.offsetLeft+m.tableWidth/2, middleY = m.offsetTop+m.tableDepth/2;
  const lineSets = {left:[x(0),y(middleY),x(e.x),y(middleY)],right:[x(e.x+e.width),y(middleY),x(m.roomWidth),y(middleY)],top:[x(middleX),y(0),x(middleX),y(e.y)],bottom:[x(middleX),y(e.y+e.height),x(middleX),y(m.roomDepth)]};
  SIDES.forEach(side => {
    const [x1,y1,x2,y2] = lineSets[side];
    svgNode('line',{x1,y1,x2,y2,class:`dimension-line${result.crossing.includes(side)?' boundary-crossing':''}`});
  });
  document.getElementById('diagram-description').textContent = `Rectangular room ${textValue(m.roomWidth)} wide and ${textValue(m.roomDepth)} deep, with a table ${textValue(m.tableWidth)} wide and ${textValue(m.tableDepth)} deep. Remaining after chair extents: ${SIDES.map(side => `${side} ${textValue(result.remaining[side])}`).join(', ')}. Negative values cross the named boundary.`;
}

function sourceLabel() { return measuredControl.checked ? 'User-entered measurements (self-confirmed)' : 'Unconfirmed inputs / illustrative example'; }

function render() {
  const validFields = Object.keys(fields).map(validateField).every(Boolean);
  const result = computeModel(values);
  const geometricValues = [...Object.values(result.remaining),...Object.values(result.envelope),values.roomWidth,values.roomDepth,result.envelope.x+result.envelope.width,result.envelope.y+result.envelope.height];
  const bounds = drawingBounds(values,result.envelope);
  const finiteGeometry = geometricValues.every(Number.isFinite) && Object.values(bounds).every(Number.isFinite) && bounds.spanX > 0 && bounds.spanY > 0 && bounds.scale > 0;
  modelIsValid = validFields && finiteGeometry;
  const error = document.getElementById('model-error');
  error.hidden = modelIsValid;
  error.textContent = validFields ? 'These values are too large or small to draw. Enter room and furniture measurements at a practical scale.' : 'Complete the highlighted measurements to draw the model and export a record.';
  document.getElementById('diagram-wrap').classList.toggle('invalid',!modelIsValid);
  document.getElementById('print').disabled = !modelIsValid;
  document.getElementById('export').disabled = !modelIsValid;
  document.getElementById('source-badge').textContent = measuredControl.checked ? 'Measurements confirmed' : 'Inputs unconfirmed';
  SIDES.forEach(side => {
    const cell = document.querySelector(`[data-side="${side}"]`);
    const output = cell.querySelector('.result-value');
    const caption = cell.querySelector('.result-caption');
    const remaining = Math.abs(result.remaining[side]) < 1e-9 ? 0 : result.remaining[side];
    cell.classList.toggle('crossing',modelIsValid && remaining < 0);
    output.replaceChildren();
    output.append(document.createTextNode(modelIsValid ? displayNumber(fromCm(remaining,unit)) : '—'));
    if(modelIsValid) { const suffix=document.createElement('span');suffix.className='value-unit';suffix.textContent=unit;output.append(suffix); }
    caption.textContent = !modelIsValid ? 'Awaiting valid inputs' : remaining < 0 ? 'Envelope crosses boundary' : remaining === 0 ? 'Envelope touches boundary' : 'Remaining in this model';
  });
  const status = document.getElementById('calculation-status');
  status.textContent = !modelIsValid ? 'Calculation paused until inputs are valid.' : result.crossing.length ? `The entered envelope crosses ${result.crossing.join(', ')} ${result.crossing.length===1?'boundary':'boundaries'}.` : 'The entered envelope stays within the four room boundaries in this model.';
  document.getElementById('print-record').textContent = `Record source: ${sourceLabel()}. Display units: ${unit}. Geometry only; assess item-specific fit, routes and safe passage separately.`;
  if(modelIsValid) drawModel(result);
  else {svgContent.replaceChildren();document.getElementById('diagram-description').textContent='The diagram is unavailable while measurements are invalid.';}
}

form.addEventListener('submit',event => event.preventDefault());
Object.entries(fields).forEach(([key,input]) => input.addEventListener('input',() => {
  if(validateField(key)) values[key]=toCm(input.valueAsNumber,unit);
  document.getElementById('export-status').textContent='';
  render();
}));

unitControl.addEventListener('change',() => {
  const invalidKeys = Object.keys(fields).filter(key => !validateField(key));
  unit = unitControl.value;
  Object.entries(fields).forEach(([key,input]) => {
    if(!invalidKeys.includes(key)) input.value=inputNumber(fromCm(values[key],unit));
    else input.value='';
  });
  document.querySelectorAll('.unit-label').forEach(label => label.textContent=unit);
  document.getElementById('export-status').textContent='';
  render();
});

measuredControl.addEventListener('change',render);
document.getElementById('reset').addEventListener('click',() => {
  Object.assign(values,DEFAULTS);
  measuredControl.checked=false;
  Object.entries(fields).forEach(([key,input]) => input.value=inputNumber(fromCm(values[key],unit)));
  document.getElementById('export-status').textContent='Illustrative measurements restored.';
  render();
});

const formulaDetails = document.querySelector('.formula');
let formulaWasOpen = false;
window.addEventListener('beforeprint',() => {
  formulaWasOpen = formulaDetails.open;
  formulaDetails.open = true;
  document.getElementById('print-record').textContent += ` Prepared ${new Date().toLocaleString()}.`;
});
window.addEventListener('afterprint',() => {
  formulaDetails.open = formulaWasOpen;
  render();
});
document.getElementById('print').addEventListener('click',() => {
  if(modelIsValid) window.print();
});

function csvCell(value) { return `"${String(value).replaceAll('"','""')}"`; }
document.getElementById('export').addEventListener('click',() => {
  if(!modelIsValid) return;
  const now=new Date();
  const result=computeModel(values);
  const rows=[['WEHOMZ Dining Table Clearance Modeller'],['Created at',now.toISOString()],['Measurement source',sourceLabel()],['Display unit',unit],['Scope','Rectangular geometry from entered values. Assess item-specific fit, movement, routes and safe passage separately.'],[],['Measurement','Stored centimetres',`Value in ${unit}`]];
  Object.keys(values).forEach(key => rows.push([LABELS[key],values[key],fromCm(values[key],unit)]));
  rows.push([],['Remaining after extent','Stored centimetres',`Value in ${unit}`]);
  SIDES.forEach(side => rows.push([side,result.remaining[side],fromCm(result.remaining[side],unit)]));
  rows.push([],['Left formula','left offset - left extent'],['Right formula','room width - left offset - table width - right extent'],['Top formula','top offset - top extent'],['Bottom formula','room depth - top offset - table depth - bottom extent'],['Envelope note','Four side extents combined into a rectangle; individual chair shapes and corners are not modelled.'],['Publisher','WEHOMZ retailer; prepared with AI assistance.']);
  const csv='\uFEFF'+rows.map(row => row.map(csvCell).join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download=`wehomz-dining-clearance-${now.toISOString().slice(0,10)}.csv`;document.body.append(anchor);anchor.click();anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url),1000);
  document.getElementById('export-status').textContent='CSV prepared locally. It includes the measurement-source label and stored centimetre values.';
});

render();
