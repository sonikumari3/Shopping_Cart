const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const { default: mongoose } = require('mongoose');
const app = express();
const multer = require('multer') //allows us to accept multiple type of data

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any())

mongoose.connect("mongodb+srv://itstheanurag:gaurav9878764239@cluster0.dirde.mongodb.net/Group7Database", {
    useNewUrlParser: true
})
.then( () => console.log("connected to database"))
.catch ( err => console.log(err) )


app.use('/', route);


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});