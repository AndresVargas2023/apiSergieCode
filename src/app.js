require('dotenv').config();
console.log('JWT_SECRET_KEY:', process.env.JWT_SECRET_KEY); // Agrega esta línea para depuración

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { config } = require('dotenv');
config();

const bookRoutes = require('./routes/book.routes');
const userRoutes = require('./routes/user.routes');
const errorHandler = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');

const app = express();
// Middlewares
app.use(express.json());
app.use(cookieParser());

// Habilitar CORS
app.use(cors());

// Parseador de Bodies
app.use(bodyParser.json());

// Manejo de errores
app.use(errorHandler);

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
app.use('/users', userRoutes);
const sessionRoutes = require('./routes/session.routes');
app.use("/api/session", sessionRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor iniciado en el puerto ${port}`);
});
