const jwt = require('jsonwebtoken');
const User = require('../model/User');

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization;
console.log("token "+ token);
    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log("decoded"+decoded);
        const user = await User.findById(decoded.userId);
console.log("user"+user);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = authMiddleware;