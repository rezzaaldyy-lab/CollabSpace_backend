const express = require('express');
const router = express.Router();
const creatorController = require('../controllers/creatorController');

router.get('/', creatorController.getCreators);
router.get('/:id', creatorController.getCreatorById);
router.put('/:id', creatorController.updateCreator);
router.get('/:id/skills', creatorController.getCreatorSkills);
router.post('/:id/skills', creatorController.addCreatorSkill);
router.delete('/:id/skills/:skillId', creatorController.deleteCreatorSkill);
router.get('/:id/portfolio', creatorController.getCreatorPortfolio);

module.exports = router;