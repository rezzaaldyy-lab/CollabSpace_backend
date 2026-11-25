const db = require('../config/databases');

exports.getCreators = async (req, res) => {
    try {
        const { search, skill, role, availability } = req.query;
        let query = 'SELECT DISTINCT u.id, u.name, u.role, u.bio as description, u.avatar, u.availability, u.github, u.linkedin FROM users u';
        let conditions = [];
        let params = [];

        if (skill) {
            query += ' JOIN user_skills us ON u.id = us.user_id JOIN skills s ON us.skill_id = s.id';
            conditions.push('s.name LIKE ?');
            params.push(`%${skill}%`);
        }

        if (search) {
            conditions.push('(u.name LIKE ? OR u.role LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (role) {
            conditions.push('u.role LIKE ?');
            params.push(`%${role}%`);
        }

        if (availability) {
            conditions.push('u.availability = ?');
            params.push(availability);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const [creators] = await db.execute(query, params);

        for (let creator of creators) {
            const [skills] = await db.execute('SELECT s.name FROM skills s JOIN user_skills us ON s.id = us.skill_id WHERE us.user_id = ?', [creator.id]);
            creator.skills = skills.map(s => s.name);

            const [portfolios] = await db.execute('SELECT title, technology as tech FROM portfolios WHERE user_id = ?', [creator.id]);
            creator.projects = portfolios;
        }

        res.json({ success: true, message: 'Daftar creator berhasil diambil', data: creators });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCreatorById = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, name, email, role, bio as description, avatar, availability, github, linkedin FROM users WHERE id = ?', [req.params.id]);
        if (users.length === 0) return res.status(404).json({ success: false, message: 'Creator tidak ditemukan' });
        
        const creator = users[0];
        const [skills] = await db.execute('SELECT s.name FROM skills s JOIN user_skills us ON s.id = us.skill_id WHERE us.user_id = ?', [creator.id]);
        creator.skills = skills.map(s => s.name);

        const [portfolios] = await db.execute('SELECT title, description, technology, project_url FROM portfolios WHERE user_id = ?', [creator.id]);
        creator.projects = portfolios;

        res.json({ success: true, message: 'Detail creator berhasil diambil', data: creator });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCreator = async (req, res) => {
    try {
        const {name, role, bio, availability, github, linkedin} = req.body;
        await db.execute(
            'UPDATE users SET name = ?, role = ?, bio = ?, availability = ?, github = ?, linkedin = ? WHERE id = ?',
            [name, role, bio, availability, github, linkedin, req.params.id]
        );
        res.json({ success: true, message: 'Profil berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCreatorSkills = async (req, res) => {
    try {
        const [skills] = await db.execute('SELECT s.id, s.name FROM skills s JOIN user_skills us ON s.id = us.skill_id WHERE us.user_id = ?', [req.params.id]);
        res.json({ success: true, data: skills });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addCreatorSkill = async (req, res) => {
    try {
        const { skill_id } = req.body;
        await db.execute('INSERT INTO user_skills (user_id, skill_id) VALUES (?, ?)', [req.params.id, skill_id]);
        res.status(201).json({ success: true, message: 'Skill berhasil ditambahkan' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCreatorSkill = async (req, res) => {
    try {
        await db.execute('DELETE FROM user_skills WHERE user_id = ? AND skill_id = ?', [req.params.id, req.params.skillId]);
        res.json({ success: true, message: 'Skill berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCreatorPortfolio = async (req, res) => {
    try {
        const [portfolios] = await db.execute('SELECT * FROM portfolios WHERE user_id = ?', [req.params.id]);
        res.json({ success: true, data: portfolios });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};