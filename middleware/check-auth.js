const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	if (req.headers.authorization === undefined) {
		return res.status(401).json({
			message: 'Token required'
		});
	}
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_KEY);
		req.userData = decoded;
		next();
	} catch (error) {
		return res.status(401).json({
			message: 'Auth failed',
			token: req.headers.authorization.split(" ")[1]
		});
	}
};