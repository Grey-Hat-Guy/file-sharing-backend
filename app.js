require('dotenv').config({ path: './config/.env' });
const express = require('express');
const cookieParser = require("cookie-parser");
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const authMiddleware = require('./midddlewares/authMiddleware');
const cors = require('cors');

connectDB();

const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true
};

const app = express();

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/files', fileRoutes);

app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
