import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import '../server/env.mjs';
import {credentialFile} from '../server/admin-auth.mjs';
const prompt=readline.createInterface({input:process.stdin,output:process.stdout});
try {
  const username=(await prompt.question('Admin username or email: ')).trim().toLowerCase();
  if (!/^[a-z0-9@._-]{3,100}$/.test(username)) throw Error('Use 3–100 letters, digits, @, dot, hyphen or underscore.');
  // Generate a high-entropy password; do not echo a user-entered password.
  const password=crypto.randomBytes(18).toString('base64url');
  const salt=crypto.randomBytes(16).toString('hex');
  const hash=crypto.scryptSync(password,salt,64).toString('hex');
  if(fs.existsSync(credentialFile)) throw Error('Admin already exists. Credential replacement requires a separate recovery procedure.');
  fs.mkdirSync(path.dirname(credentialFile),{recursive:true,mode:0o700});
  fs.writeFileSync(credentialFile,JSON.stringify({username,salt,hash}),{mode:0o600,flag:'wx'});
  console.log(`Administrator created: ${username}\nPassword (store securely; shown once): ${password}`);
} catch(error) {console.error(error.message);process.exitCode=1;} finally {prompt.close();}
