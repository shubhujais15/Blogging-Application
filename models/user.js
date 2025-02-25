const { Schema, model } = require('mongoose');
// No need to install crypto, it is inbuilt
const { createHmac, randomBytes } = require("crypto");
const { createTokenForUser } = require('../services/authentication');

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,
        // required: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageURL: {
        type: String,
        default: '/images/avatar.png'
    },
    role: {
        type: String,
        enum: ["USER","ADMIN"], // we only define USER and ADMIN while login ourself
        default: "USER",
    }

},{timestamps: true})


// before saving the details of a user we hashmap the password 
// pre saving details using .pre function
userSchema.pre("save", function(next) {
    const user = this;

    if(!user.isModified("password")) return;

    // creating 16 digit random key
    const salt = randomBytes(16).toString();
    // const salt = 'someRandomSalt';

    // create hashmap
    const hashedPassword = createHmac('sha256', salt)
    .update(user.password)
    .digest("hex");

    this.salt = salt;
    this.password = hashedPassword;
    next();
});

// Creating virtual function named matchPasswordAndGenerateToken to find user by matching hashed password
userSchema.static('matchPasswordAndGenerateToken', async function(email,password){
    const user = await this.findOne({email});

    if(!user) throw new Error('User not found');

    const salt = user.salt;
    const hashedPassword = user.password;

    // creating hash for login user password
    const userProvidedHash = createHmac('sha256', salt)
    .update(password)
    .digest("hex");

    if(hashedPassword !== userProvidedHash) throw new Error('Incorrect Password');

    // If it is matched means user gave correct password then we return user object
    // Passing password as undefined to make our password safe
    // return { ...user, password:undefined, salt:undefined}

    // if password is matched then we return the token
    const token = createTokenForUser(user);
    return token;
})

const User = model('user',userSchema);

module.exports = User;