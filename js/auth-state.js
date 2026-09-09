// Local preview identity only. Live authentication requires a server session.
async function hashPassword(value, existingSalt) {
  const salt = existingSalt ? Uint8Array.from(existingSalt.match(/../g), byte => parseInt(byte, 16)) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(value), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', iterations: 100000, salt }, key, 256);
  const hex = bytes => Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex(salt)}:${hex(new Uint8Array(bits))}`;
}
async function verifyDemoPassword(value, record) {
  if (typeof record !== 'string' || !/^[a-f0-9]{32}:[a-f0-9]{64}$/.test(record)) return false;
  return await hashPassword(value, record.split(':')[0]) === record;
}
function getAuthUsers() {
  const users = readSavedState('techpro_demo_users_v2', []);
  return Array.isArray(users) ? users.filter(user => user && user.id != null && typeof user.name === 'string' && typeof user.password === 'string') : [];
}

function getAuthSession() {
  return readPersistentSession();
}

function setAuthSession(user) {
  const session = {
    loggedIn: true,
    id: user.id,
    name: user.name,
    nameEn: user.nameEn || user.name,
    phone: user.phone,
    email: user.email || '',
    address: user.address || '',
    loyaltyPoints: Number(user.loyaltyPoints || 0)
  };
  if (!isDemoMode() || !validLocalSession(session)) throw new Error('Invalid local preview session');
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  try { sessionStorage.removeItem(AUTH_SESSION_KEY); } catch {}
  restoreCommerceState();
  return session;
}

function clearAuthSession() {
  localStorage.setItem(AUTH_SESSION_KEY, 'null');
  try { sessionStorage.removeItem(AUTH_SESSION_KEY); } catch {}
  restoreCommerceState();
}

