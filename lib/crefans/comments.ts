/** Studio-wide comment switch wins over the per-post setting; a post without an explicit flag is treated as open. */
export const postCommentsAllowed=(studioEnabled:boolean,postEnabled?:boolean)=>studioEnabled&&postEnabled!==false;
