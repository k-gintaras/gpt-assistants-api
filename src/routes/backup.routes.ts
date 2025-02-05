import { Router } from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const router = Router();

router.get('/backup', (req, res) => {
  const backupFile = path.join(__dirname, 'backup.sql');

  exec(`pg_dump -U postgres -F c mydatabase > ${backupFile}`, (err) => {
    if (err) {
      console.error('Backup failed:', err);
      return res.status(500).send('Backup failed');
    }

    res.download(backupFile, 'database_backup.sql', (downloadErr) => {
      if (downloadErr) {
        console.error('Download error:', downloadErr);
      }
      fs.unlinkSync(backupFile); // Clean up after sending
    });
  });
});

export default router;
