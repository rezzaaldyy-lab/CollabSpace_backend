const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const creatorRoutes = require('./routes/creatorRoutes');
const projectRoutes = require('./routes/projectRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // BARU: Import route pembayaran

const app = express();

app.use(cors());
app.use(express.json()); // Ini sudah ada, berfungsi sebagai body-parser bawaan

// Routes API CollabSpace
app.use('/api/auth', authRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/payments', paymentRoutes); // BARU: Daftarkan route pembayaran

app.get('/', (req, res) => {
    jsonRes = { success: true, message: 'API CollabSpace Berjalan Normal' };
    res.json(jsonRes);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server CollabSpace berjalan di port ${PORT}`);
});