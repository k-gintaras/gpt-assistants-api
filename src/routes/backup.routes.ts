import { Router } from 'express';
import { getDb } from '../database/database';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb().getInstance();
    const client = await db.connect();

    // Stream the SQL dump directly into response
    const result = await client.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
    `);

    const allTables = result.rows.map((row) => row.table_name);
    let dump = '';

    for (const table of allTables) {
      const tableData = await client.query(`SELECT * FROM ${table}`);
      dump += `-- Dumping table: ${table}\n`;
      dump += JSON.stringify(tableData.rows, null, 2) + '\n\n';
    }

    client.release();

    res.setHeader('Content-Disposition', 'attachment; filename="backup.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(dump);
  } catch (error) {
    console.error('Backup failed:', error);
    res.status(500).send('Backup failed');
  }
});

export default router;
