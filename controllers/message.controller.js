import Message from '../models/message.js';
import User from '../models/user.js';
import Housing from '../models/housing.js'; 
import pusher from '../config/pusher.js';
import mongoose from 'mongoose';

// Fonction helper pour créer un conversationId unique
const generateConversationId = (userId1, userId2, housingId) => {
  const sortedIds = [userId1, userId2].sort();
  return housingId ? `${sortedIds[0]}-${sortedIds[1]}-${housingId}` : `${sortedIds[0]}-${sortedIds[1]}`;
};

// ENVOYER UN MESSAGE AVEC PUSHER
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, housingId } = req.body;
    const senderId = req.userId;

    console.log('📤 Envoi message:', { senderId, receiverId, housingId });

    // Validation
    if (!receiverId || !message) {
      return res.status(400).json({ result: false, error: 'Missing receiverId or message' });
    }

    // Vérifier que le receiver existe
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ result: false, error: 'Receiver not found' });
    }

    // Créer le conversationId
    const conversationId = generateConversationId(senderId, receiverId, housingId);

    // Créer le message
    const newMessage = new Message({
      conversationId,
      sender: senderId,
      receiver: receiverId,
      housing: housingId || null,
      message: message.trim()
    });

    const savedMessage = await newMessage.save();

    // Populate pour renvoyer les infos complètes
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('sender', 'firstName lastName photo')
      .populate('receiver', 'firstName lastName photo')
      .populate('housing', 'title price');

    // 🔥 PUSHER : Envoyer le message en temps réel
    try {
      await pusher.trigger(`conversation-${conversationId}`, 'new-message', {
        message: populatedMessage
      });

      // Notification pour le receiver
      await pusher.trigger(`user-${receiverId}`, 'new-message-notification', {
        conversationId,
        sender: {
          _id: populatedMessage.sender._id,
          firstName: populatedMessage.sender.firstName,
          lastName: populatedMessage.sender.lastName,
          photo: populatedMessage.sender.photo
        },
        message: message.trim(),
        housing: populatedMessage.housing
      });
    } catch (pusherError) {
      console.error('⚠️ Pusher error:', pusherError);
      // On continue quand même, le message est sauvegardé
    }

    res.json({ result: true, message: populatedMessage });
  } catch (err) {
    console.error(' Error sending message:', err);
    res.status(500).json({ result: false, error: err.message });
  }
};

// RÉCUPÉRER TOUS LES MESSAGES D'UNE CONVERSATION
export const getConversationMessages = async (req, res) => {
  try {
    const { otherUserId, housingId } = req.params;
    const currentUserId = req.userId;

    console.log('📨 Récupération messages:', { currentUserId, otherUserId, housingId });

    if (!otherUserId) {
      return res.status(400).json({ result: false, error: 'Missing otherUserId' });
    }

    // Créer le conversationId
    const conversationId = generateConversationId(currentUserId, otherUserId, housingId);

    // Récupérer tous les messages de cette conversation
    const messages = await Message.find({ conversationId })
      .populate('sender', 'firstName lastName photo')
      .populate('receiver', 'firstName lastName photo')
      .sort({ createdAt: 1 }); // Du plus ancien au plus récent

    res.json({ result: true, messages, conversationId });
  } catch (err) {
    console.error(' Error getting messages:', err);
    res.status(500).json({ result: false, error: err.message });
  }
};

// RÉCUPÉRER TOUTES LES CONVERSATIONS DE L'UTILISATEUR
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.userId;

    console.log('getUserConversations appelé');
    console.log('userId:', userId);
    console.log('type:', typeof userId);

    // Vérification du userId
    if (!userId) {
      console.error(' userId manquant dans req');
      return res.status(400).json({ 
        result: false, 
        error: 'UserId not found in request' 
      });
    }

    // Vérifier que c'est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('userId invalide:', userId);
      return res.status(400).json({ 
        result: false, 
        error: 'Invalid userId format' 
      });
    }

    console.log('🔍 Recherche des messages...');

    // Récupérer tous les messages où l'utilisateur est sender ou receiver
    const messages = await Message.find({
      $or: [
        { sender: userId }, 
        { receiver: userId }
      ]
    })
    .populate({
      path: 'sender',
      select: 'firstName lastName photo',
      options: { strictPopulate: false }
    })
    .populate({
      path: 'receiver',
      select: 'firstName lastName photo',
      options: { strictPopulate: false }
    })
    .populate({
      path: 'housing',
      select: 'title price location pictures',
      options: { strictPopulate: false }
    })
    .sort({ createdAt: -1 })
    .lean()
    .exec();

    console.log('📦 Messages trouvés:', messages.length);

    // Si aucun message, retourner un tableau vide
    if (messages.length === 0) {
      console.log('ℹ️ Aucun message trouvé');
      return res.json({ result: true, conversations: [] });
    }

    // Grouper par conversationId et ne garder que le dernier message
    const conversationsMap = new Map();

    messages.forEach((msg, index) => {
      try {
        // Vérifications de sécurité
        if (!msg.sender || !msg.receiver) {
          console.warn(`⚠️ Message ${index} incomplet:`, {
            id: msg._id,
            hasSender: !!msg.sender,
            hasReceiver: !!msg.receiver
          });
          return;
        }

        const convId = msg.conversationId;
        
        if (!conversationsMap.has(convId)) {
          // Déterminer l'autre utilisateur
          const userIdStr = userId.toString();
          const senderIdStr = msg.sender._id.toString();
          const receiverIdStr = msg.receiver._id.toString();
          
          const isSender = senderIdStr === userIdStr;
          const otherUser = isSender ? msg.receiver : msg.sender;

          // Double vérification
          if (!otherUser || !otherUser._id) {
            console.warn('⚠️ otherUser invalide pour conversation:', convId);
            return;
          }

          // Compter les messages non lus pour cette conversation
          const unreadCount = messages.filter(m => {
            if (!m.receiver || !m.receiver._id) return false;
            return m.conversationId === convId && 
                   m.receiver._id.toString() === userIdStr && 
                   !m.isRead;
          }).length;

          conversationsMap.set(convId, {
            conversationId: convId,
            otherUser: {
              _id: otherUser._id,
              firstName: otherUser.firstName || 'Unknown',
              lastName: otherUser.lastName || '',
              photo: otherUser.photo || null
            },
            housing: msg.housing ? {
              _id: msg.housing._id,
              title: msg.housing.title || 'Sans titre',
              price: msg.housing.price,
              location: msg.housing.location,
              pictures: msg.housing.pictures
            } : null,
            lastMessage: msg.message,
            lastMessageDate: msg.createdAt,
            unreadCount,
            isLastMessageFromMe: isSender
          });
        }
      } catch (msgError) {
        console.error('Erreur traitement message:', msgError);
      }
    });

    // Convertir en array et trier par date
    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate));

    console.log('Conversations formatées:', conversations.length);

    res.json({ result: true, conversations });
    
  } catch (err) {
    console.error(' Error getting conversations:', err);
    console.error('Stack:', err.stack);
    console.error(' UserId dans catch:', req.userId);
    
    res.status(500).json({ 
      result: false, 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// MARQUER LES MESSAGES COMME LUS
export const markMessagesAsRead = async (req, res) => {
  try {
    const { otherUserId, housingId } = req.body;
    const currentUserId = req.userId;

    console.log('👁️ Marquer comme lu:', { currentUserId, otherUserId, housingId });

    if (!otherUserId) {
      return res.status(400).json({ result: false, error: 'Missing otherUserId' });
    }

    const conversationId = generateConversationId(currentUserId, otherUserId, housingId);

    // Marquer tous les messages non lus de cette conversation comme lus
    const result = await Message.updateMany(
      {
        conversationId,
        receiver: currentUserId,
        isRead: false
      },
      {
        isRead: true
      }
    );

    console.log(' Messages marqués lus:', result.modifiedCount);

    //  PUSHER : Notifier que les messages sont lus
    if (result.modifiedCount > 0) {
      try {
        await pusher.trigger(`user-${otherUserId}`, 'messages-read', {
          conversationId,
          readBy: currentUserId
        });
      } catch (pusherError) {
        console.error('⚠️ Pusher error:', pusherError);
      }
    }

    res.json({ result: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ result: false, error: err.message });
  }
};

// SUPPRIMER UNE CONVERSATION (optionnel)
export const deleteConversation = async (req, res) => {
  try {
    const { otherUserId, housingId } = req.params;
    const currentUserId = req.userId;

    console.log('🗑️ Suppression conversation:', { currentUserId, otherUserId, housingId });

    const conversationId = generateConversationId(currentUserId, otherUserId, housingId);

    const result = await Message.deleteMany({ conversationId });

    console.log('Messages supprimés:', result.deletedCount);

    res.json({ result: true, message: 'Conversation deleted', deletedCount: result.deletedCount });
  } catch (err) {
    console.error('Error deleting conversation:', err);
    res.status(500).json({ result: false, error: err.message });
  }
};