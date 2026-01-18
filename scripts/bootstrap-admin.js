"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebaseAdmin_1 = require("../src/firebaseAdmin");
const uid = process.argv[2];
if (!uid) {
    console.error('Usage: node dist/scripts/bootstrap-admin.js <uid>');
    process.exit(1);
}
(async () => {
    try {
        await firebaseAdmin_1.admin.auth().setCustomUserClaims(uid, { role: 'admin', canUseGpt: true });
        console.log('✅ Bootstrapped admin:', uid);
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error bootstrapping admin:', error);
        process.exit(1);
    }
})();
