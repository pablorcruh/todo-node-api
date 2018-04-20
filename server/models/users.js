
var mongoose=require('mongoose');

var Users=mongoose.model('User',{
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    }
});

module.exports={Users}