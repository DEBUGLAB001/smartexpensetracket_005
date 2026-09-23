const walletService = require('../services/wallet.service');
const { sendSuccess, sendError } = require('../utils/response');

const getWallets = async (req, res, next) => {
  try {
    const wallets = await walletService.getWallets(req.user.id);
    sendSuccess(res, 200, wallets, 'Wallets retrieved');
  } catch (error) {
    next(error);
  }
};

const createWallet = async (req, res, next) => {
  try {
    const { walletName, balance, currency } = req.body;
    if (!walletName) return sendError(res, 422, 'Wallet name is required');
    const wallet = await walletService.createWallet(req.user.id, walletName, balance, currency);
    sendSuccess(res, 201, wallet, 'Wallet created');
  } catch (error) {
    next(error);
  }
};

const updateWallet = async (req, res, next) => {
  try {
    const wallet = await walletService.updateWallet(req.params.id, req.user.id, req.body);
    sendSuccess(res, 200, wallet, 'Wallet updated');
  } catch (error) {
    next(error);
  }
};

const deleteWallet = async (req, res, next) => {
  try {
    const success = await walletService.deleteWallet(req.params.id, req.user.id);
    if (!success) return sendError(res, 404, 'Wallet not found');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWallets,
  createWallet,
  updateWallet,
  deleteWallet
};
