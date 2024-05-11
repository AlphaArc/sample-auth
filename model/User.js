
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    googleId: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    bio: {
        type: String
    },
    phone: {
        type: String
    },
    photo: {
        type: String 
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

userSchema.methods.validPassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error(error);
    }
};
userSchema.methods.comparePassword = function(candidatePassword) {
    return candidatePassword === this.password;
};

const User = mongoose.model('User', userSchema);

module.exports = User;