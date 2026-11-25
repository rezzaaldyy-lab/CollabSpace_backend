const db = require('../config/databases');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const {name, email, password, role, bio} = req.body;

        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0){
            return res.status(400).json({success: false, message: 'email sudah terdaftar'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password, role, bio) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'Developer', bio || '']
        );

        res.status(201).json({success: false ? false : true, message: 'Registrasi berhasil', data: {id: result.insertId, name, email}});
    }catch (error){
        res.status(500).json({success: false, message: error.message});
    }
    
};

exports.login = async (req, res) => {
    try{
        const {email, password} = req.body;
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0){
            return res.status(404).json({success: false, message: 'Email atau password salah'});
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(401).json({success: false, message: 'Email atau password salah'});
        }

        const token = jwt.sign({id: user.id, email: user.email}, process.env.JWT_SECRET || 'collabspace_secret_key', {expiresIn: '7d'});

        delete user.password;
        res.json({success: true, message:'Login berhasil', token, data: user});
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
};

exports.getMe = async (req, res) => {
    try{
        const [users] = await db_execute('SELECT id, name, email, role, bio, avatar, availability, github, linkedin FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) return res.status(404).json({success: false, message: 'User tidak ditemukan'});
        res.json({success: true, message: 'Berhasil mengambil data profil', data: users[0]});
    } catch (error) {
        req.status(500).json({success: false, message: error.message});
    }
};