const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({success: false, message: 'Token autentikasi tidak ditemukan'});
    }

    jwt.verify(token, process.env.JWT_SECRET || 'collabspace_secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({success: false, message: 'Token tidak valid atau kedaluwarsa'});
        }
        req.user = user;
        next();
    });
};

module.exports = verifyToken;