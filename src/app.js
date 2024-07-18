const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { config } = require('dotenv');
config();

const bookRoutes = require('./routes/book.routes');

const app = express();

// Habilitar CORS
app.use(cors());

// Parseador de Bodies
app.use(bodyParser.json());

// Conexión a la base de datos
mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.MONGO_DB_NAME,
  serverSelectionTimeoutMS: 50000, 
  ssl: true
})
.then(() => console.log('Conexión a MongoDB exitosa'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

const db = mongoose.connection;

app.use('/books', bookRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor iniciado en el puerto ${port}`);
});
