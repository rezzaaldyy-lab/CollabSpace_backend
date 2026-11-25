const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');

router.post('/', invitationController.sendInvitation);
router.get('/', invitationController.getInvitations);
router.put('/:id/accept', invitationController.acceptInvitation);
router.put('/:id/decline', invitationController.declineInvitation);

module.exports = router;