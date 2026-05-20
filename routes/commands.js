const express = require('express');
const router = express.Router();
const commandsController = require('../controllers/commandsController');

router.get('/', commandsController.viewAllCommands);
router.post('/add', commandsController.addCommand);
router.delete('/delete/:commandId', commandsController.deleteCommand);

module.exports = router;
