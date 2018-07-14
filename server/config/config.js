var env=process.env.NODE_ENV || 'development';

if(env==='development' || env ==='test'){
    var config=require('./configuration');
    var envConfig=config[env];
    console.log('>>>>>>>>>>>>',envConfig);
    Object.keys(envConfig).forEach((key)=>{
        process.env[key]=envConfig[key];
        console.log('----------',envConfig[key]);
    });
}
