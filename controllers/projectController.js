const db = require('../config/databases');

exports.getProjects = async (req, res) => {
    try {
        const { search, skill } = req.query;
        let query = 'SELECT p.*, u.name as owner_name FROM projects p JOIN users u ON p.owner_id = u.id';
        let conditions = [];
        let params = [];

        if (search) {
            conditions.push('(p.title LIKE ? OR p.description LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const [projects] = await db.execute(query, params);

        for (let proj of projects) {
            const [skills] = await db.execute('SELECT s.name FROM skills s JOIN project_skills ps ON s.id = ps.skill_id WHERE ps.project_id = ?', [proj.id]);
            proj.skills = skills.map(s => s.name);
            proj.matchScore = "85%"; // Contoh UI/Demo matching score
        }

        res.json({ success: true, message: 'Daftar proyek berhasil diambil', data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const [projects] = await db.execute('SELECT p.*, u.name as owner_name FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.id = ?', [req.params.id]);
        if (projects.length === 0) return res.status(404).json({ success: false, message: 'Proyek tidak ditemukan' });

        const project = projects[0];
        const [skills] = await db.execute('SELECT s.name FROM skills s JOIN project_skills ps ON s.id = ps.skill_id WHERE ps.project_id = ?', [project.id]);
        project.skills = skills.map(s => s.name);

        res.json({ success: true, message: 'Detail proyek berhasil diambil', data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createProject = async (req, res) => {
    try {
        const { owner_id, title, description, category, image } = req.body;
        const [result] = await db.execute(
            'INSERT INTO projects (owner_id, title, description, category, image) VALUES (?, ?, ?, ?, ?)',
            [owner_id, title, description, category, image || '']
        );
        res.status(201).json({ success: true, message: 'Proyek berhasil dibuat', data: { id: result.insertId, title } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const { title, description, category, status, image } = req.body;
        await db.execute(
            'UPDATE projects SET title = ?, description = ?, category = ?, status = ?, image = ? WHERE id = ?',
            [title, description, category, status, image, req.params.id]
        );
        res.json({ success: true, message: 'Proyek berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        await db.execute('DELETE FROM projects WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Proyek berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProjectMembers = async (req, res) => {
    try {
        const [members] = await db.execute(
            'SELECT u.id, u.name, u.role, u.avatar FROM users u JOIN project_members pm ON u.id = pm.user_id WHERE pm.project_id = ?',
            [req.params.id]
        );
        res.json({ success: true, data: members });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.joinProject = async (req, res) => {
    try {
        const { user_id } = req.body;
        const projectId = req.params.id;
        
        await db.execute('INSERT IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)', [projectId, user_id]);
        res.status(201).json({ success: true, message: 'Berhasil bergabung ke proyek' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProjectMatch = async (req, res) => {
    try {
        const projectId = req.params.id;
        
        const [projectSkills] = await db.execute('SELECT skill_id FROM project_skills WHERE project_id = ?', [projectId]);
        const pSkillIds = projectSkills.map(s => s.skill_id);

        if (pSkillIds.length === 0) {
            return res.json({ success: true, data: [], message: 'Proyek belum menentukan skill khusus' });
        }

        const [creators] = await db.execute('SELECT id, name, role, avatar FROM users');
        let matchedResults = [];

        for (let creator of creators) {
            const [cSkills] = await db.execute('SELECT skill_id FROM user_skills WHERE user_id = ?', [creator.id]);
            const cSkillIds = cSkills.map(s => s.skill_id);

            const commonSkills = cSkillIds.filter(id => pSkillIds.includes(id));
            const matchPercentage = Math.round((commonSkills.length / pSkillIds.length) * 100);

            matchedResults.push({
                ...creator,
                matchScore: `${matchPercentage > 100 ? 100 : matchPercentage}%`
            });
        }

        matchedResults.sort((a, b) => parseInt(b.matchScore) - parseInt(a.matchScore));

        res.json({ success: true, message: 'Hasil matching creator berhasil dihitung', data: matchedResults });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};