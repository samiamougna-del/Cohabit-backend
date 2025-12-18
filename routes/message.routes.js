import express from 'express';
import authJwt from '../middlewares/authJwt.js';
import {
  sendMessage,
  getConversationMessages,
  getUserConversations,
  markMessagesAsRead,
  deleteConversation
} from '../controllers/message.controller.js';

const router = express.Router();

// Envoyer un message
router.post('/send', [authJwt.verifyToken], sendMessage);

// Récupérer tous les messages d'une conversation
router.get('/conversation/:otherUserId/:housingId?', [authJwt.verifyToken], getConversationMessages);

// Récupérer toutes les conversations de l'utilisateur
router.get('/conversations', [authJwt.verifyToken], getUserConversations);

// Marquer les messages comme lus
router.patch('/markAsRead', [authJwt.verifyToken], markMessagesAsRead);

// Supprimer une conversation (optionnel)
router.delete('/conversation/:otherUserId/:housingId?', [authJwt.verifyToken], deleteConversation);

export default router;