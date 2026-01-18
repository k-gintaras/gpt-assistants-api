import { admin } from '../src/firebaseAdmin';

const args = process.argv.slice(2);
const uid = args[0];
const canUseGpt = args[1] === 'true';

if (!uid) {
  console.error('Usage: npx ts-node tools/set-claims.ts <uid> true|false');
  process.exit(1);
}

(async () => {
  try {
    await admin.auth().setCustomUserClaims(uid, { canUseGpt });
    console.log(`✅ Set claims for ${uid}:`, { canUseGpt });
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting claims:', error);
    process.exit(1);
  }
})();
