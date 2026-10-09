const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/products', productRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint không tồn tại' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Product service đang chạy tại http://localhost:${PORT}`);
});