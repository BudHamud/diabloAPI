import { chromium } from 'playwright'
import fs from 'fs/promises'
import express from 'express'
import cron from 'node-cron';
import cors from 'cors'
import 'dotenv/config'

const app = express()
const PORT = process.env.PORT

const diabloResults = async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto('https://diabloimmortal.blizzard.com/en-gb/')
  const list = await page.evaluate(() => {
    let results = []
    // [slot="gallery-items]
    document.querySelectorAll('blz-card').forEach((e, i) => {
      results.push({ index: i, title: e.innerText, link: e.href, img: e.childNodes[0].src })
    })
    return results
  })

  await browser.close()
  return list
}

app.use(cors())
app.get('/es', async (req, res) => {
  const read = await fs.readFile('./db/db.json', 'utf-8')
  const result = await JSON.parse(read)
  res.json(result)
})
app.get('/en', async (req, res) => {
  const read = await fs.readFile('./db/test.json', 'utf-8')
  const result = await JSON.parse(read)
  res.json(result)
})
// app.get('/update', async (req, res) => {
//   const getData = await diabloResults('nodejs')
//   const read = await fs.readFile('./db/test.json', 'utf-8')
//   const json = await JSON.parse(read)
//   if (JSON.stringify(json) !== JSON.stringify(getData)) {
//     await fs.writeFile('./db/test.json', JSON.stringify(getData, null, 2), 'utf-8')
//   }
//   res.json(json)
// })

const server = app.listen(PORT, () => {
  console.log('Server on ' + PORT)
})

// Ejecutar la función automáticamente cada hora (3600000 milisegundos)
cron.schedule('0 * * * *', async () => {
  const getData = await diabloResults('nodejs')
  const read = await fs.readFile('./db/test.json', 'utf-8')
  const json = await JSON.parse(read)
  if (JSON.stringify(json) !== JSON.stringify(getData)) {
    await fs.writeFile('./db/test.json', JSON.stringify(getData, null, 2), 'utf-8')
  }
  console.log(`Actualizacion hecha ${new Date()}`)
});