require('dotenv').config({ path: './config/.env' });
const express = require('express');
const cookieParser = require("cookie-parser");
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const authMiddleware = require('./midddlewares/authMiddleware');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

connectDB();

const app = express();

const corsOptions = {
    origin: ["http://localhost:3000", "https://file-sharing-frontend-phi.vercel.app"],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"]
};

const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}


app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use('/api', authRoutes);
app.use('/api/files', fileRoutes);

app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

app.get('/', (req, res) => {
    res.send("Hello Server");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
