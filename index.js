const express = require("express")
const app = express()

const port = process.env.PORT || 3000

app.use(express.static('public'))
app.set('views', './views');
app.set('view engine', 'ejs');

app.get("/", function(req, res){
    //res.send("Teste do deploy OK")
    res.render('index')
})

app.listen(port)