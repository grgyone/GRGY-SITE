import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('COMPOSITIONS exhibition is distinct from Composition and preserves both language routes',async()=>{
for(const prefix of ['','ru/']){
const html=await readFile(new URL('../'+prefix+'works/compositions-exhibition/index.html',import.meta.url),'utf8');
assert.match(html,/<h1>COMPOSITIONS<\/h1>/);assert.match(html,/Selected Works 2022–2024/);
assert.match(html,/https:\/\/oncyber.io\/compositions/);assert.match(html,/COMPOSITIONS — Exhibition/);
assert.match(html,/href="\/works\/compositions-exhibition\/" lang="en"/);
assert.match(html,/href="\/ru\/works\/compositions-exhibition\/" lang="ru"/);
assert.match(html,/href="\/(?:ru\/)?works\/composition\/"/);
assert.doesNotMatch(html,/dateClosed|endDate/);
}
});
