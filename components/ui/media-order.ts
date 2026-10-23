/** Pure helpers for drag-to-reorder: shared by pointer, touch and keyboard paths so the experience matches. */
export type Box={left:number;top:number;width:number;height:number};
export function moveItem<T>(list:T[],from:number,to:number):T[]{
  if(from===to||from<0||to<0||from>=list.length||to>=list.length)return list;
  const next=[...list];const [item]=next.splice(from,1);next.splice(to,0,item);return next;
}
/** While `from` is being dragged toward `to`, every item in between slides one slot toward the vacated spot. */
export function slotFor(index:number,from:number,to:number):number{
  if(from===to||index===from)return index;
  if(from<to&&index>from&&index<=to)return index-1;
  if(from>to&&index>=to&&index<from)return index+1;
  return index;
}
/** Index of the box under the pointer, or `fallback` when the pointer is outside every box. */
export function indexAt(boxes:Box[],x:number,y:number,fallback:number):number{
  const hit=boxes.findIndex(box=>x>=box.left&&x<=box.left+box.width&&y>=box.top&&y<=box.top+box.height);
  return hit===-1?fallback:hit;
}
