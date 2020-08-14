const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const fs = require('fs');
const yup = require('yup');


const app = express();


app.use(helmet());
app.use(morgan('short'));
app.use(cors());


app.use(express.json()) //only accept json data
app.use(express.static('./public'))

// modelos utilizados. podemos agregar mas propiedades con restricciones, 
// u otros datos que hagan falta
const schema = yup.object().shape({
    name : yup.string().matches(/[\w_]/i) // nombre del modelo contiene palabras y _
})

app.get('/', (req, res) => {
    res.json({
        message: 'asxp CC - Club College svg retrieving service.'
    })
});

app.post('/model', async (req, res, next) => {
    const { name } = req.body;
    try{
        await schema.validate({name})
        if(!name){
            name = "";
        }

        //search directory tree

        fromDir('../svg/' + name + '/',/\.svg$/,function(filename){
            //console.log('-- found: ',filename);
            res.json({
                name
            });
        });


        // res.json({
        //     name
        // });
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
    console.log(`Listening at http://localhost:${port}`);

})


// // checks for available update and returns an instance
// const pkg = JSON.parse(fs.readFileSync(__dirname + '/../package.json'));
