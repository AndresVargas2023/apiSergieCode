const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    publication_date: {
        type: String,
        required: true
    },
    image_url: {
        type: String,
        required: false // Si deseas que este campo sea opcional, establece en `false`
    },
    download_url: {
        type: String,
        required: false // Si deseas que este campo sea opcional, establece en `false`
    },
    description: {
        type: String,
        required: false // Si deseas que este campo sea opcional, establece en `false`
    }
});

module.exports = mongoose.model('Book', bookSchema);
