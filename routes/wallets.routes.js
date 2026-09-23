const express = require('express');
const router = express.Router();
const walletsController = require('../controllers/wallets.controller');

router.get('/', walletsController.getWallets);
router.post('/', walletsController.createWallet);
router.patch('/:id', walletsController.updateWallet);
router.delete('/:id', walletsController.deleteWallet);

module.exports = router;
