require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 8080;

// Routes
const searchRoutes = require('./routes/search');
const artistRoutes = require('./routes/artist');
const artworksRoutes = require('./routes/artworks');
const categoriesRoutes = require('./routes/categories');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');

// Middleware
app.use(cookieParser());

// ✅ Use env-based CORS origin (local OR deployed frontend)
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:4200';

app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

app.use(express.json());

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@sahil.iklhq8n.mongodb.net/?retryWrites=true&w=majority&appName=SAHIL`;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/search', searchRoutes);
app.use('/api/artist', artistRoutes);
app.use('/api/artworks', artworksRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

// Static frontend build (for deployment)
app.use(express.static(path.join(__dirname, '../frontend/dist/frontend')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});