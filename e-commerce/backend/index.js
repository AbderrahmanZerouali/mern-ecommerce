const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt  = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

app.use(express.json());
app.use(cors());

//connection de la base de donnee
mongoose.connect('mongodb://0.0.0.0:27017/ecommerce', {useNewUrlParser: true, })
const db = mongoose.connection

db.on('error', (err)=>{
    console.log(err)
    })
db.once('open', ()=>{
    console.log('Connexion réussie à la base de donnee !')
    })


//Creation de l' API
app.get("/", (req, res)=>{
    res.send("Express App is running")
}); 

//Image Storage Engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "upload/images");
    },
    filename: (req, file, cb)=>{
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
});

const upload = multer({storage:storage});

//Creating Upload Endpoint for images   
app.use('/images',express.static(path.join(__dirname, 'upload/images')));
app.post("/upload", upload.single('product'), (req, res) =>{
    console.log(req.file);
    res.json({
        success : 1,
        image_url : `http://localhost:${port}/images/${req.file.filename}`
    });

})


// schema for creating products

const Product = mongoose.model('Product', {
    id:{
        type: Number, 
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    new_price:{
        type: String,
        required: true
    },
    old_price:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now,
    },
    available:{
        type: Boolean,
        default: true,
    },
})

//creating API for adding products

app.post('/addproduct', async(req, res)=>{
    
    let products = await Product.find({});
    let id;

    if(products.length > 0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    }
    else{
        id = 1;
    }

    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log('saved');
    res.json({
        success: true,
        name:req.body.name,
    })
})

//creating API for deleting

app.post('/removeproduct', async(req, res) =>{
    await Product.findOneAndDelete({id: req.body.id});
    console.log('deleted');
    res.json({
        success : true,
        name : req.body.name, 
    })
})

//creating API for listing all products
app.get('/allproducts', async(req, res) =>{
    let products = await Product.find({});
    console.log('all product are listed');
    res.send(products);
})

// schema creating for user model

const Users = mongoose.model('Users',{
    name:{
        type: 'string',
    },
    email:{
        type: 'string',
        unique: true,
    },
    password:{
        type: 'string',
    },
    cartData:{
        type: Object,
    },
    date:{
        type: Date,
        default: Date.now,
    }
})

// Creating endpoint for registring the user

app.post('/signup', async (req, res) => {
    let check = await Users.findOne({email: req.body.email});
    if (check){
        return res.status(400).json({success:false, errors:'existing user found with same email'})
    }
    let cart ={};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }
    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    })

    await user.save();
    console.log('user saved successfully in database');

    const data = {
        user : {
            id : user.id
        }
    }

    const token = jwt.sign(data, 'secret_ecom');
    res.json({
        success : true, 
        token
    })

})

// creating endpoint for user login

app.post('/login',async (req, res) => {
    let user = await Users.findOne({email:req.body.email});
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare){
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data, 'secret_ecom');
            res.json({
                success: true,
                token,
            });
        }
        else{
            res.json({
                success: false,
                errors:"Wrong Password"
            });
        }
    }
    else{
        res.json({success: false, errors:"Invalid Email Adress"})
    }
})

//creating endpoint for new collection data
app.get('/newcollections', async (req, res) =>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("new collection fetched");
    res.send(newcollection);
})

// creating endpoint for related products

app.get('/relatedproducts', async (req, res) => {
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    try {
        const products = await Product.find({});
        
        const shuffledProducts = shuffleArray(products);
        const relatedProducts = shuffledProducts.slice(0, 8);
        res.json(relatedProducts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



//creating middleware to fetch user

const fetchUser = (req, res, next) =>{
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({errors: "authentificate using a valid token"})
    }
    else{
        try{
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        } catch (error){
            res.status(401).send({errors: "authentificate using a valid token"})
        }
    }
}
// creating endpoint for adding to cart

app.post('/addtocart', fetchUser, async (req, res) =>{
    console.log("added", req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});
    
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({_id: req.user.id}, {cartData:userData.cartData});
    res.send("Added to cart")
})

// creating endpoint for deleting from cart

app.post('/removefromcart', fetchUser, async (req, res) =>{
    console.log("removed", req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId] > 0)
    userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({_id: req.user.id}, {cartData:userData.cartData});
    res.send("Removed from cart")
})

// creating endpoint to get cart data

app.post('/getcart', fetchUser, async (req, res) => {
    console.log("get cart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);

})

//API for listenning to the server port

app.listen(port, (error)=>{
    if (!error){
        console.log("server is running on port " + port)
    }else{
        console.log("Error: " + error);
    }
});