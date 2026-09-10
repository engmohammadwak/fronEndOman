import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,unlink,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

test('encrypted secrets fail closed when their original key is missing',async()=>{
 const directory=await mkdtemp(path.join(tmpdir(),'techpro-key-test-'));
 process.env.TECHPRO_DATA_DIR=directory;
 try {
  const {seal,open}=await import('../server/secrets.mjs');
  const encrypted=seal('test-value');assert.equal(open(encrypted),'test-value');
  const changedByte = (parseInt(encrypted.slice(-2),16) ^ 1).toString(16).padStart(2,'0');
  assert.throws(()=>open(encrypted.slice(0,-2)+changedByte));
  await unlink(path.join(directory,'.key'));
  assert.throws(()=>open(encrypted),/key missing/);
  await assert.rejects(access(path.join(directory,'.key')));
 }finally{await rm(directory,{recursive:true,force:true});}
});
