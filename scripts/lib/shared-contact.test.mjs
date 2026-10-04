import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ensureSharedContact} from './shared-contact.mjs';
const home=fs.readFileSync(new URL('../../legacy-mirror/index.html',import.meta.url),'utf8');
test('shared contact copies the complete homepage form before footer and stays idempotent',()=>{
 const source='<html><head></head><body><main>Service</main><footer>Footer</footer></body></html>';
 const output=ensureSharedContact(source,home);
 assert.match(output,/name="form_fields\[message1\]"/);
 assert.ok(output.indexOf('</form>')<output.indexOf('<footer'));
 assert.equal((output.match(/<form\b/g)||[]).length,1);
 assert.match(output,/href="\/wp-content\//);
 assert.equal(ensureSharedContact(output,home),output);
});
test('existing forms remain intact',()=>assert.equal(ensureSharedContact(home,home),home));
test('missing homepage section fails explicitly',()=>assert.throws(()=>ensureSharedContact('<footer></footer>',''),/missing/));
