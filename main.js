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

        res.json({
            name
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



const port = process.env.PORT || 1337
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);

})


// // checks for available update and returns an instance
// const pkg = JSON.parse(fs.readFileSync(__dirname + '/../package.json'));
