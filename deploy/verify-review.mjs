import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const origin = process.argv[2] || 'https://words-of-wisdom-4t7.pages.dev';
const results = [];
async function query(name, input) {
  const suffix = input === undefined ? '' : '?input=' + encodeURIComponent(JSON.stringify({json:input}));
  const response = await fetch(`${origin}/api/trpc/${name}${suffix}`);
  assert.equal(response.status, 200, `${name}: HTTP ${response.status}`);
  return (await response.json()).result.data.json;
}
async function check(name, work) {
  const start = Date.now();
  try { const measurement = await work(); results.push({name, outcome:'Worked', ms:Date.now()-start, measurement}); }
  catch (error) { results.push({name, outcome:'Failed', error:error.message}); }
}
await check('HTTPS homepage and emitted assets contain no removed-platform references', async () => {
  const response = await fetch(origin);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Words of Wisdom/);
  assert.doesNotMatch(html, /manus|butterfly-effect|__manus__/i);
  const files = [...html.matchAll(/(?:src|href)="([^"\s]+\.(?:js|css))"/g)].map(match=>match[1]);
  assert.ok(files.length >= 2);
  for (const file of files) {
    const asset = await fetch(new URL(file, origin));
    assert.equal(asset.status, 200);
    assert.doesNotMatch(await asset.text(), /manus|butterfly-effect|webdev\.v1/i);
  }
  return {assets:files.length};
});
let all;
await check('Seeded quote library', async () => {
  all = await query('quotes.list', {});
  assert.ok(all.length >= 559, `Only ${all.length} quotes`);
  return {quotes:all.length};
});
await check('Daily quote with source video', async () => {
  const quote = await query('quotes.daily');
  assert.ok(quote.text && quote.videoUrl && quote.speakerName);
  assert.ok(all.some(q=>q.id === quote.id));
  return {id:quote.id, speaker:quote.speakerName};
});
await check('Search and topic filtering', async () => {
  const item = all.find(q=>q.topic && q.speakerName);
  const matches = await query('quotes.list', {search:item.speakerName, topic:item.topic});
  assert.ok(matches.some(q=>q.id === item.id));
  assert.ok(matches.every(q=>q.topic === item.topic));
  const empty = await query('quotes.list', {search:'NO_MATCH_915AECB2'});
  assert.equal(empty.length, 0);
  return {matches:matches.length, emptySearch:empty.length};
});
await check('Speaker archive', async () => {
  const speakers = await query('quotes.speakerNames');
  assert.ok(speakers.length > 0);
  const quotes = await query('quotes.bySpeaker', {speakerName:speakers[0]});
  assert.ok(quotes.length > 0);
  return {speakers:speakers.length, firstSpeakerQuotes:quotes.length};
});
await check('Anonymous admin mutation denied', async () => {
  const response = await fetch(`${origin}/api/trpc/quotes.add`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({json:{text:'This must never be added'}})});
  assert.equal(response.status, 401);
  return {status:response.status};
});
await check('Client routes', async () => {
  for (const route of ['/library','/speakers','/james','/login']) assert.equal((await fetch(origin+route)).status, 200);
  return {routes:4};
});
await check('Production sign-in without email credentials refuses to expose a login token', async () => {
  const response = await fetch(`${origin}/api/trpc/auth.requestLoginLink`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({json:{email:'review-acceptance@example.com'}})});
  assert.equal(response.status, 412);
  const body = await response.text();
  assert.match(body, /Email login is not configured/);
  assert.doesNotMatch(body, /devLink|token=/);
  return {status:response.status, emailDelivery:'requires configuration'};
});
const receipt = {origin, timestamp:new Date().toISOString(), results};
await writeFile('review-verification.json', JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt,null,2));
if (results.some(result=>result.outcome === 'Failed')) process.exitCode=1;
