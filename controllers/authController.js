const pool = require('../db');

const login = async (req, res) => {
    console.log('Login route called'); // Debugging log
    const { username, password } = req.body;
    console.log(username,password);

    try {
        const user = await pool.query(
            'SELECT * FROM users WHERE username = $1 AND password = $2',
            [username, password]
        );

        if (user.rows.length > 0) {
            res.status(200).json({ message: 'Login successful', user: user.rows[0] });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { login };