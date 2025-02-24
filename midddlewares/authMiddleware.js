const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        // return res.status(401).json({ message: 'No token, authorization denied' });
        return res.redirect('https://file-sharing-frontend-phi.vercel.app');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        // res.status(401).json({ message: 'Token is not valid' });
        return res.redirect('https://file-sharing-frontend-phi.vercel.app');
    }
};

module.exports = authMiddleware;