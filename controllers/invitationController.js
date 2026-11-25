const db = require('../config/databases');

exports.sendInvitation = async (req, res) => {
    try {
        const { sender_id, receiver_id, project_id, message } = req.body;
        await db.execute(
            'INSERT INTO invitations (sender_id, receiver_id, project_id, message, status) VALUES (?, ?, ?, ?, "pending")',
            [sender_id, receiver_id, project_id, message || '']
        );
        res.status(201).json({ success: true, message: 'Undangan kolaborasi berhasil dikirim' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInvitations = async (req, res) => {
    try {
        const [invitations] = await db.execute(`
            SELECT i.*, p.title as project_title, u.name as sender_name 
            FROM invitations i 
            JOIN projects p ON i.project_id = p.id 
            JOIN users u ON i.sender_id = u.id
        `);
        res.json({ success: true, data: invitations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.acceptInvitation = async (req, res) => {
    try {
        const invId = req.params.id;
        
        const [invs] = await db.execute('SELECT * FROM invitations WHERE id = ?', [invId]);
        if (invs.length === 0) return res.status(404).json({ success: false, message: 'Undangan tidak ditemukan' });
        
        const inv = invs[0];

        await db.execute('UPDATE invitations SET status = "accepted" WHERE id = ?', [invId]);

        await db.execute('INSERT IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)', [inv.project_id, inv.receiver_id]);

        res.json({ success: true, message: 'Undangan diterima dan kreator resmi bergabung ke proyek' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.declineInvitation = async (req, res) => {
    try {
        await db.execute('UPDATE invitations SET status = "declined" WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Undangan ditolak' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};