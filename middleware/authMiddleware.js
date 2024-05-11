module.exports = {
    isAdmin: (req, res, next) => {
        if (req.user && req.user.isAdmin) {
            return next();
        } else {
            return res.status(403).json({ message: 'Admin access required' });
        }
    },
    isNormalUser: (req, res, next) => {
        if (req.user && !req.user.isAdmin) {
            return next();
        } else {
            return res.status(403).json({ message: 'Normal user access only' });
        }
    }
};
