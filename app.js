import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { chromium } from 'playwright'
import cors from 'cors'
import express from 'express'
import cron from 'node-cron';
import 'dotenv/config'

const app = express()
const PORT = process.env.PORT

app.use(cors())

const dbPromise = open({
  filename: './db/database.db',
  driver: sqlite3.Database,
});

app.get('/en', async (req, res) => {
  try {
    const db = await dbPromise;

    const results = await db.all('SELECT * FROM diablo_results');

    res.json(results);
  } catch (error) {
    console.error('Ocurrió un error:', error);
    res.status(500).json({ error: 'Error al obtener los resultados' });
  }
});

app.listen(PORT, () => {
  console.log(`Server on ${PORT}`);
});

const diabloResults = async (url) => {
  const db = await dbPromise;
  await db.run(`CREATE TABLE IF NOT EXISTS diablo_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    \`index\` INTEGER,
    title TEXT,
    link TEXT,
    img TEXT
  )`);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const results = await page.evaluate(() => {
    const elements = document.querySelectorAll('blz-card');
    const results = [];

    elements.forEach((element, index) => {
      const title = element.innerText;
      const link = element.href;
      const img = element.childNodes[0].src;

      results.push({ index, title, link, img });
    });

    return results;
  });

  await browser.close();

  // Borra los resultados anteriores
  await db.run(`DELETE FROM diablo_results`);

  // Inserta los nuevos resultados en la base de datos
  for (const result of results) {
    await db.run(`INSERT INTO diablo_results (\`index\`, title, link, img) VALUES (?, ?, ?, ?)`, [result.index, result.title, result.link, result.img]);
  }

  // Consulta los resultados de la base de datos
  const rows = await db.all(`SELECT * FROM diablo_results`);

  return rows;
};

// Ejemplo de uso de la función diabloResults
cron.schedule('* * * * *', async () => {
  try {
    const results = await diabloResults('https://diabloimmortal.blizzard.com/en-gb/');
    console.log(results);
  } catch (error) {
    console.error('Ocurrió un error:', error);
  }
});