import { admin } from '../src/firebaseAdmin';

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node dist/scripts/bootstrap-admin.js <uid>');
  process.exit(1);
}

await admin.auth().setCustomUserClaims(uid, { role: 'admin', canUseGpt: true });
console.log('✅ Bootstrapped admin claims for:', uid);
process.exit(0);
