import mongoose from "mongoose";
 
const userSchema = new mongoose.Schema(
    {
    
        firstName: {
            type: String,
            required: true, 
            trim: true,
        },

        lastName: {
            type: String,
            required: true, 
            trim: true,
        },

        age: {
            type: Number,
           /* required: true, 
            trim: true,*/
        },

        photo: {
            type: String,
          //  required: true, 
        },

        bio: {
            type: String,
          //  required: true, 
            maxlength: 500,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            trim: true,
        },
// a verifier 
        phoneNumber: {
            type: String,
            unique: [true, "Phone number is already in use."],
            required: true,
            trim: true,
            default: "",
         }, 
         
        preferences: { 
        budgetMin: Number,
        budgetMax: Number,
        location: String,
        lifestyle: [String],
        expectations: [String],
         },

         favorites: [{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'housing',
         }],

        roles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Role",
            },
        ],
    },
    { timestamps: true },
);
 
const User = mongoose.model("User", userSchema);
export default User;