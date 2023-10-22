const exp = require('express');
const bp = require('body-parser');
const DB = require('./modules/db');
const knex = require('knex')
const bcrypt = require('bcrypt'); 


const db = knex({
    client:'pg',
    connection:{
        host: '127.0.0.1',
        port: '5432',
        user: 'postgres',
        password: 'Elite%159',
        database: 'Snack'
    }
})
const app = exp();
app.use(exp.static('public'));
app.set('view engine', 'ejs');

app.use(bp.urlencoded({ extended: false }))
app.use(bp.json())

const port = 3000;

// API to add Items into database
app.post('/addItem', (req, res) => {
    console.log(req.body.items);
    const promises = req.body.items.map(item => {
        return DB.createItem(item); // Assuming createItem executes the SQL insert query
    });

    Promise.all(promises)
        .then(data => {
            console.log({ message: 'Items added successfully', response: data });
            res.status(200).send({ message: `Items added successfully` });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({ message: 'Internal server error' });
        });
});

// API to get All Items from database
app.get('/getItems', (req, res)=>{
    db('fooditems')
        .select('*')
        .then(data => {
            console.log({message:'data reseved from database', items: data});
            res.send(data)
        })
        .catch(err => {
            console.log(err);
            res.send({message:err.detail})
        })
})


// API to render landing page
app.get('/', (req, res) => {
    res.render('index') 
})
// API to render sign up page
app.get('/register', (req, res) => {
    res.render('registerForm') 
})
// API to render ordering page
app.get('/ordering', (req, res) => {
    res.render('ordering') 
})
// API to render log in page
app.get('/login', (req, res) => {
    res.render('loginForm') 
})
// API to render home page
// use login API to send online user to home page by ejs
var onlineUser ;
app.get('/home', (req, res) => {
    console.log(`this is online user: ${onlineUser}`)
    res.render('home', { online: onlineUser }) 
})


// API for register  //**********************************************************//
app.post('/register',(req,res)=>{
    console.log('requist recived', req.body)
    const temp = Object.values(req.body)
    console.log(temp)
    if(!isEnyInputEmpty(temp)){

        if(isUserAllreadyExsist()){
            res.sendStatus = 404;
            res.send({message : "Hello this account is allready exsist"})
        }
        else{
            console.log(`im sending from the server :`)
            console.log(req.body)
            DB.createUser(req.body)
            .then(data => {
                res.sendStatus = 200;
                res.send({message : `Hello ${req.body.firstname} your account is now created!`}) //add firstname to the message
            })
            .catch(err => {
                res.send({message:err.detail})
            })
        }     
    }
    else{
        res.sendStatus = 404;
        res.send({message : "Please fill all the fields"})
    }
    function isEnyInputEmpty(temp){
        if(temp.length < 5){
            return true;
        }
        else{
            return temp.some((val) => val == "" || val == null);
        }
    }
    function isUserAllreadyExsist(){
        const {firstname,lastname,email,username,password} = req.body;
        db('users')
        .select('user_id','username')
        .where({username:username})
        .then(data => {
            console.log(data);
            if(data.length>0){
                return true;
            }
            else {
                return false;
            }
        })
        .catch(err => {
            console.log(err);
            res.send({message:err.detail})
        })
    }
    
})

// API for login  /**********************************************************//
app.post('/login',(req,res)=>{
    console.log('requist recived', req.body)
    const temp = Object.values(req.body)
    console.log(temp)
    if(!isEnyInputEmpty(temp)){
        const {user, pass} = req.body;
        db('users')
        .select('user_id','username')
        .where({username:user})
        .then(data => {
            console.log(data);
            if(data.length>0){
                onlineUser = data[0].username;
                res.send({message:`Welcome back: ${data[0].username}  |  User_id: ${data[0].user_id}`, username: data[0].username, admission  : true})
               /* if(bcrypt.compareSync(pass, data[0].password)){  //--------------------------
                    res.send({message:`Welcome back: ${data[0].username}  |  User_id: ${data[0].user_id}`, username: data[0].username, admission  : true})
                }
                else{
                    res.send({message:'Wrong password'})
                }*/
            }
            else {
                res.send({message : "Hello this account is not registred", admission  : false})
            }
        })
        .catch(err => {
            console.log(err);
            res.send({message:err.detail})
        })
    }
    else{
        res.sendStatus = 404;
        res.send({message : "Please fill all the fields"})
    }
    function isEnyInputEmpty(temp){
        if(temp.length < 2){
            return true;
        }
        else{
            return temp.some((val) => val == "" || val == null);
        }
    }  
})

app.listen(port, ()=> console.log(`server listening on port ${port} `))

