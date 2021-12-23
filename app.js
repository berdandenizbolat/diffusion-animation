const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

router.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/index.html'))
});

app.use(express.static(__dirname));
const port = process.env.port || 3000
app.listen(port);

console.log('Server is running at port ' + port);