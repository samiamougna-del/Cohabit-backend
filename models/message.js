import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    // Référence à la conversation (student user et senior user et housing )
    conversationId: {
      type: String,
      required: true,
      index: true
    },
    
    // Qui envoie message
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // Qui reçoitmessage
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // Le logement concerné 
    housing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'housing'
    },
    
    // Contenu du message
    message: {
      type: String,
      required: true,
      trim: true
    },
    
    // Si le message a été lu
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true 
  }
);

// Index pour optimiser les requêtes
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;