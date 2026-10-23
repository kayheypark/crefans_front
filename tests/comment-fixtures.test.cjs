const test=require('node:test');
const assert=require('node:assert/strict');
const {loadTypeScript}=require('./load-typescript.cjs');
const {messyCommentThreads,toSocialComments,toSocialReplies,toCommunityComments,messyFanPool}=loadTypeScript('components/preview/comment-fixtures.ts');

test('messy threads are deterministic, numerous enough to page, and mix short, long, empty-ish bodies',()=>{
  const threads=messyCommentThreads('morning',37),again=messyCommentThreads('morning',37);
  assert.deepEqual(threads,again);
  assert.equal(threads.length,37);assert.ok(threads.length>10);
  assert.ok(threads.some(thread=>thread.body.length>500));assert.ok(threads.some(thread=>thread.body.length<=5));
  assert.ok(threads.every(thread=>thread.body.length<=1000));
  assert.deepEqual(messyCommentThreads('behind',0),[]);
  assert.notDeepEqual(messyCommentThreads('morning',5),messyCommentThreads('cat-day',5));
});

test('threads carry two-depth replies from fans and the creator, plus mass mentions up to 100 people',()=>{
  const threads=messyCommentThreads('morning',37);
  assert.equal(threads[0].replies.length,0);
  assert.ok(threads.some(thread=>thread.replies.length>=3));
  assert.ok(threads.some(thread=>thread.replies.some(reply=>reply.author===null)));
  assert.ok(threads.some(thread=>thread.replies.some(reply=>reply.author!==null)));
  assert.ok(threads.every(thread=>thread.replies.every(reply=>!('replies' in reply))));
  const hundred=threads.find(thread=>thread.mentions.length===100);
  assert.ok(hundred);assert.equal(new Set(hundred.mentions.map(fan=>fan.id)).size,100);
  assert.ok(hundred.mentions.every(fan=>fan.id!==hundred.author.id));
  assert.ok(threads.some(thread=>thread.mentions.length===0));
  assert.ok(threads.some(thread=>thread.replies.some(reply=>reply.mentions.length>=20)));
  assert.equal(messyFanPool.length,120);assert.ok(messyFanPool.some(fan=>fan.image===''));
});

test('adapters map threads to fan and studio comment shapes without inventing data',()=>{
  const threads=messyCommentThreads('morning',6);
  const social=toSocialComments(threads),community=toCommunityComments('morning',threads),replies=toSocialReplies(threads);
  assert.equal(social.length,6);assert.equal(community.length,6);
  assert.deepEqual(social.map(item=>item.id),threads.map(item=>item.id));
  assert.ok(social.every(item=>!('replies' in item)&&typeof item.replyCount==='number'&&Array.isArray(item.mentions)),'fan comments carry only a reply count; replies load on demand');
  assert.deepEqual(social.map(item=>item.replyCount),threads.map(item=>item.replies.length));
  assert.ok(threads.some(item=>item.fromCreator)&&social.some(item=>item.fromCreator&&item.author.name==='하늘'),'the creator also leaves top-level comments');
  assert.ok(social.every(item=>!item.fromCreator||item.mentions.length===0));
  assert.deepEqual(Object.keys(replies),threads.filter(item=>item.replies.length).map(item=>item.id));
  const creatorReply=Object.values(replies).flat().find(reply=>reply.fromCreator);
  const fanReply=Object.values(replies).flat().find(reply=>!reply.fromCreator);
  if(creatorReply)assert.equal(creatorReply.author.name,'하늘');
  if(fanReply)assert.ok(fanReply.author.name);
  assert.ok(community.every(item=>item.postId==='morning'&&typeof item.hidden==='boolean'));
  assert.ok(community.flatMap(item=>item.replies).every(reply=>reply.author===undefined||reply.author.id));
});
