import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const userSchema = 
    mongoose.Schema({
        tagname: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        email: { type: String, required: true , unique: true },
        friends : [{
            type: mongoose.Schema.Types.ObjectId,
            ref:'User'
        }]
    },
    {timestamps: true}
);

userSchema.plugin(uniqueValidator);

export default mongoose.model('User', userSchema);