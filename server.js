const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const mongoConnection = 'mongodb+srv://adrian:adrian@cluster0.t7kg8mj.mongodb.net/yu-gi-oh?retryWrites=true&w=majority'; // URL de la base de datos MongoDB

mongoose.connect(mongoConnection, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Se realizó la conexión con mongo');
  })
  .catch((error) => {
    console.error('No se pudo conectar con mongo:', error);
  });

const cartaSchema = new mongoose.Schema({
  tipo: String,
  nombre: String,
  descripcion: String,
  puntosBatalla: Number,
});

const Carta = mongoose.model('Cartas_registradas', cartaSchema);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/cartas', async (req, res) => {
  try {
    const cartas = await Carta.find();
    res.json(cartas);
  } catch (error) {
    console.log('Error al obtener la lista de cartas:', error);
    res.status(500).json({ error: 'Error al obtener la lista de cartas' });
  }
});

app.post('/cartas', async (req, res) => {
  try {
    const nuevaCarta = new Carta(req.body);
    await nuevaCarta.save();
    res.sendStatus(200);
  } catch (error) {
    console.log('Error al registrar la carta', error);
    res.status(500).json({ error: 'Error al registrar la carta' });
  }
});

app.put('/cartas/:id', async (req, res) => {
  try {
    const cartaId = req.params.id;
    const cartaEditada = req.body;
    await Carta.findByIdAndUpdate(cartaId, cartaEditada);
    res.sendStatus(200);
  } catch (error) {
    console.log('Error al editar la carta', error);
    res.status(500).json({ error: 'Error al editar la carta' });
  }
});

app.delete('/cartas/:id', async (req, res) => {
  try {
    const cartaId = req.params.id;
    await Carta.findByIdAndDelete(cartaId);
    res.sendStatus(200);
  } catch (error) {
    console.log('Error al eliminar la carta', error);
    res.status(500).json({ error: 'Error al eliminar la carta' });
  }
});

app.post('/cartas/search', async (req, res) => {
  try {
    const searchTerm = req.body.searchTerm.toLowerCase();
    const resultados = await Carta.find({
      $or: [
        { nombre: { $regex: searchTerm, $options: 'i' } },
        { tipo: { $regex: searchTerm, $options: 'i' } },
      ],
    });
    res.json(resultados);
  } catch (error) {
    console.log('Error al buscar cartas:', error);
    res.status(500).json({ error: 'Error al buscar cartas' });
  }
});

app.use('/images', express.static(path.join(__dirname, 'images')));

const { exec } = require('child_process');
exec('npx node-sass --watch scss -o public/css', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error al compilar Sass: ${error}`);
    return;
  }
});

app.listen(PORT, () => {
  console.log(`Servidor alojado en el puerto: ${PORT}`);
});