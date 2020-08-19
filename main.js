const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const fs = require('fs');
const yup = require('yup');
const path = require('path');
const log4js = require('log4js');


const app = express();
var logger = log4js.getLogger();
logger.level = "debug";

logger.debug("starting service...");

app.use(helmet());
app.use(cors());

if (app.get('env') == 'production') { 
    app.use(morgan('common', { skip: function(req, res) { return res.statusCode < 400 }, stream: __dirname + '/../morgan.log' })); 
} else { 
    app.use(morgan('dev')); 
} 


app.use(express.json()) //only accept json data
app.use(express.static('./public'))

// modelos utilizados. podemos agregar mas propiedades con restricciones, 
// u otros datos que hagan falta
const schema = yup.object().shape({
    name : yup.string().matches(/[\w_]/i), // nombre del modelo contiene palabras y _
    root_search: yup.string().optional()
})


app.get('/', (req, res) => {
    res.json({
        message: 'asxp CC - Club College svg models retrieving service.'
    })
});

app.post('/model', async (req, res, next) => {
    const { root_search, name } = req.body;
    try{
        await schema.validate({root_search,name})
        if(!name){
            name = "";
        }
        // if(!root_search || root_search === ""){
        //     root_search = "../svg/";
        // }

        //search directory tree

        let parts = [];

        fromDir(root_search != ""? root_search : "../svg/" + name + '/',/\.svg$/,function(filename){
            //-- found folder name, add all the file info
            parts.push(filename.replace(/\\/g,'/'));
            logger.debug("filename found : "+filename.replace(/\\/g,'/'));

        });

        res.json({
            name,
            parts
        });

    } catch (error) {
        next(error);
    }
});

app.use((error, req, res, next) => {
    if(error.status){
        res.status(error.status);
    }
    else{
        res.status(500);
    }
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? '♥' : error.stack,
    });

})

function fromDir(startPath,filter,callback){

    //console.log('Starting from dir '+startPath+'/');

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            fromDir(filename,filter,callback); //recurse
        }
        else if (filter.test(filename)) callback(filename);
    };
};



const port = process.env.PORT || 1337
app.listen(port, () => {
    logger.debug(`Listening at http://localhost:${port}`);

})


// // checks for available update and returns an instance
// const pkg = JSON.parse(fs.readFileSync(__dirname + '/../package.json'));
