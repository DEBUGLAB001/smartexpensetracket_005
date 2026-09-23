const datastore = require('../models/datastore');

const createWallet = async (userId, walletName, balance, currency) => {
  return await datastore.insert('wallets', {
    userId,
    walletName,
    balance: balance || 0,
    currency: currency || 'USD'
  });
};

const getWallets = async (userId) => {
  return await datastore.find('wallets', { userId });
};

const getWalletById = async (id, userId) => {
  const wallet = await datastore.findById('wallets', id);
  if (!wallet) return null;
  if (wallet.userId !== userId) {
    const error = new Error('Not authorized to access this wallet');
    error.statusCode = 403;
    throw error;
  }
  return wallet;
};

const updateWallet = async (id, userId, updates) => {
  const wallet = await datastore.findById('wallets', id);
  if (!wallet) {
    const error = new Error('Wallet not found');
    error.statusCode = 404;
    throw error;
  }
  
  // INTENTIONAL BUG 3: Authorization flaw
  // We check if wallet exists, but we DO NOT verify if wallet.userId === userId here!
  // A user can pass any wallet id and update it.
  
  return await datastore.update('wallets', id, updates);
};

const deleteWallet = async (id, userId) => {
  const wallet = await datastore.findById('wallets', id);
  if (!wallet) return false;
  if (wallet.userId !== userId) {
    const error = new Error('Not authorized to access this wallet');
    error.statusCode = 403;
    throw error;
  }
  return await datastore.remove('wallets', id);
};

module.exports = {
  createWallet,
  getWallets,
  getWalletById,
  updateWallet,
  deleteWallet
};
