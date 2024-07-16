const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const { config } = require('dotenv')
config()

const bookRoutes = require('./routes/book.routes')

const app = express();
app.use(bodyParser.json()) // Parseador de Bodies

// Acá conectaremos la base de datos:
mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.MONGO_DB_NAME,
  serverSelectionTimeoutMS: 50000, 
  ssl: true
  
})
.then(() => console.log('Conexión a MongoDB exitosa'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

const db = mongoose.connection;

app.use('/books', bookRoutes)

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Servidor iniciado en el puerto ${port}`)
})
