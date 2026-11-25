const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.get('/:id/members', projectController.getProjectMembers);
router.post('/:id/join', projectController.joinProject);
router.get('/:id/match', projectController.getProjectMatch);

module.exports = router;