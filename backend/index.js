const path = require('path')
const MongoClient = require('mongodb').MongoClient
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const Octokat = require('octokat')

const config = {
  mongodbUrl: 'mongodb://localhost:27017',
  frontendDirectory: path.join(__dirname, '../', 'public'),
  port: 4000,
}

// Temp state, put to mongodb
let tmp = {
  items: [
    { id: 56703853 },
  ]
}

let db

// Enable CORS
app.use(cors())

// Serve the frontend app and its files
app.use(express.static(config.frontendDirectory))

// REST API
app.get('/user', (req, res) => {
  res.send("user account information")
})

app.get('/user/status', (req, res) => {
  res.send("status page / main page?")
})

app.get('/user/repos', (req, res) => {
  const octo = new Octokat()
  octo.users('haadcode').repos
    .fetch()
    .then((repos) => {
      res.json(repos)
    })
    .catch((err) => console.error(err))
})

app.get('/user/repos/enabled', (req, res) => {
  const userId = 'ABCDEFG'
  const collection = db.collection('test')
  collection.findOne({ _id: userId })
    .then((item) => res.json({ items: item ? item.enabledRepos : [] }))
    .catch(e => res.status(500).send({ error: e.toString() }))
})

app.get('/user/repos/enable/:id', (req, res) => {
  console.log("Enable repo:", req.params.id)

  if (!req.params.id || parseInt(req.params.id) === NaN)
    return res.error("Not a valid id: " + req.params.id)

  const userId = 'ABCDEFG'
  const repoId = parseInt(req.params.id)

  const collection = db.collection('test')
  collection.updateOne(
    { _id: userId },
    { $addToSet: { enabledRepos: { id: repoId } } }, // Add the repo id to the array if its not in the array already
    { upsert: true } // Add if it doesn't exist, update if it does
  )
    .then((result) => collection.findOne({ _id: userId }))
    .then((item) => res.json({ items: item ? item.enabledRepos : [] }))
    .catch(e => res.error(e))
})

app.get('/user/repos/disable/:id', (req, res) => {
  console.log("Disable repo:", req.params.id)

  if (!req.params.id || parseInt(req.params.id) === NaN)
    return res.error("Not a valid id: " + req.params.id)

  const userId = 'ABCDEFG'
  const repoId = parseInt(req.params.id)

  tmp.items.push({ id: repoId })
  const collection = db.collection('test')
  collection.updateOne(
    { _id: userId },
    { $pull: { enabledRepos: { id: repoId } } }, // Add the repo id to the array if its not in the array already
    { upsert: true } // Add if it doesn't exist, update if it does
  )
    .then((result) => collection.findOne({ _id: userId }))
    .then((item) => res.json({ items: item ? item.enabledRepos : [] }))
    .catch(e => res.error(e))
})

MongoClient.connect(config.mongodbUrl, (err, database) => {
  db = database

  // Start the HTTP server
  app.listen(config.port, () => {
    console.log('Backend listening on port', config.port)
  })
})
