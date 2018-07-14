module.exports = {
    "test":{
        "PORT":3000,
        "MONGODB_URI":process.env.MONGO_SAMPLE,
        "JWT_SECRET":process.env.SECRET
    },
    "development":{
        "PORT":3000,
        "MONGODB_URI":process.env.MONGO_TODO,
        "JWT_SECRET":process.env.SECRET
    }
}
