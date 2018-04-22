
const mongoose=require('mongoose');
const validator=require('validator');
const jwt=require('jsonwebtoken');
const _=require('lodash');
const bcrypt=require('bcryptjs');

var UserSchema=new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique:true,
        validate:{
            validator: validator.isEmail,
            message: '{VALUE} IS NOT A VALID EMAIL'
        }
    },
    password:{
        type: String,
        require: true,
        minlength:6
    },
    tokens:[{
        access: {
            type:String,
            require:true
        },
        token:{
            type:String,
            required:true
        }
    }]

});

UserSchema.methods.toJSON=function(){
    var user=this; // llamamos al objeto individual
    var userObject=user.toObject();
    return _.pick(userObject,['_id', 'email']);
};

// usamos los metodos de instancia
UserSchema.methods.generateAuthToken=function(){
    var user=this;
    var access='auth';
    var token=jwt.sign({
            _id:user._id.toHexString(),
            access:access},'abc123').toString();
    user.tokens=user.tokens.concat([{access,token}]);
    return user.save().then(()=>{
        return token;
    });

};

// statics metodo usado para convertir en metodos de modelo
UserSchema.statics.findByToken=function(token){
    var User=this; // llamamos al objeto modelo
    var decoded;

    try{
        decoded=jwt.verify(token, 'abc123')
    }catch(e){
        return Promise.reject();
    }
    return User.findOne({
        '_id': decoded._id,
        'tokens.token':token,
        'tokens.access':'auth'
    });
};

UserSchema.pre('save',function(next){
    var user=this;
    if(user.isModified('password')){
        bcrypt.genSalt(10,(err,salt)=>{
            if(err){
                console.log('An error has ocurred salting password');
                next();
            }
            bcrypt.hash(user.password,salt,(err,hash)=>{
                if(err){
                    console.log('An error has ocurred hashing password');
                    next();
                }
                user.password=hash;
                next();
            });
        })
    }else{
        next();
    }
});

var Users=mongoose.model('User',UserSchema);

module.exports={Users}