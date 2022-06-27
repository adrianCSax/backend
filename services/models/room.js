import mongoose from 'mongoose';
// import uniqueValidator from 'mongoose-unique-validator';

const participantsValidator = (participants) => {
    return !(participants.lenth === 0 && participants >  16);
}

const roomSchema = 
    mongoose.Schema({
        name: { type: String, required: true },
        admin: {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required: true
        },
        description: {type: String},
        tags: [{type: String}],
        participants: [{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required: true,
            validate: [participantsValidator, 'The array of participans has 0 or more than 16 participants']
        }]
    },
    {timestamps: true}
);

export default  mongoose.model('Room', roomSchema);
