const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const User = require('./models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');

const salt = 10;
const secret = "sadv12c1w4cjnqgvui3b4v19px";
const multer = require('multer');
//the files middleware will be stored under ./uploads/ folder
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require("fs");
const Post = require("./models/Post.js");



//declare middleware
app.use(cors({credentials:true, origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
//configure express to allow sharing of images from server to client
// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));


// testing endpoint
app.get("/test", (req, res) => {
    res.status(200).json({status: "success"});
});

//endpoint for registering
app.post("/register", async(req, res) => {
    const {username, password} = req.body;
    //add record to database
    try{
        const user = await User.create({username, password: bcrypt.hashSync(password, salt)});
        res.json(user);
    }
    catch(e){
        res.status(400).json({e: e.message});
    }
});

//endpoint for logging in
app.post("/login", async(req, res) => {
    const {username, password} = req.body;
    //find record from database
    try{
        const user = await User.findOne({username});
        const result = bcrypt.compareSync(password, user.password);

        if (result){
            //logged in
            jwt.sign({username, id: user._id}, secret, {}, (err, token) => {
                if (err) throw err;
                //send the token as a cookie
                res.cookie('token', token, {
                    sameSite: 'none',
                    secure: true
                }).json({id: user._id, username: username});
            });
        }
        else{
            res.status(400).json('wrong credentials');
        }
    }
    catch(e){
        res.status(400).json({e: e.message});
    }
});



//endpoint to check if the user is logged in
app.get("/profile", (req, res) => {
    //res.json(req.cookies);
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) throw err;
        res.json(info);
    });
});



//endpoint to logout
app.post("/logout", (req, res) => {
    res.cookie('token', '').json('ok');
});



//endpoint to send post data to server
app.post("/post", uploadMiddleware.single('file'), async(req, res) => {

    const oldFileName = req.file.path;
    const newFileName = oldFileName + ".webp";
    //to rename files to '.webp' format so its viewable
    fs.renameSync(oldFileName, newFileName);

    const {title, summary, content} = req.body;

    //read the cookies again to get the user id
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async(err, info) => {
        if (err) throw err;
            //add the file to Post database
            const postDoc = await Post.create({
                title: title,
                summary: summary,
                content: content,
                cover: newFileName,
                author: info.id,
            });
        res.status(200).json({accepted: true});
    });

    
});



//endpoint to get posts from server to display on index page
app.get("/post", async(req, res)=>{
    try{
        const records = await Post.find().populate('author', 'username').limit(50);
        records.sort((a,b) => b.createdAt - a.createdAt)
        res.json(records);
    }
    catch (err){
        res.status(500).json({error:err.message});
    }
});



//endpoint to view the single page
app.get('/post/:id', async (req, res) => {
    const postId = req.params.id;
    try {
        const post = await Post.findById(postId).populate('author', 'username');
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        console.error('Error retrieving post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



//endpoint to retrieve data to edit a post
app.get('/edit/:id', async (req, res) => {
    try {
      const { id } = req.params;
      // Validate if id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid post ID' });
      }
      const post = await Post.findById(new mongoose.Types.ObjectId(id));
      // Check if post with the given id exists
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json(post);
    } catch (error) {
      console.error('Error fetching post for editing:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  



//endpoint to update the database record
app.put('/post/:id', uploadMiddleware.single('file'), async(req, res) => {
    const {id} = req.params;
    const oldFileName = req.file.path;
    const newFileName = oldFileName + ".webp";
    //to rename files to '.webp' format so its viewable
    fs.renameSync(oldFileName, newFileName);

    const newData = req.body;

    //read the cookies again to get the user id
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async(err, info) => {
        if (err) throw err;
            //add the file to Post database
            try {
                // Find the post by ID and update it with the new data
                const updatedPost = await Post.findByIdAndUpdate(id, newData, { new: true });
                
                // //testing
                // console.log(newData);
                // console.log(updatedPost);
                
                if (updatedPost) {
                    // If the post was found and updated successfully
                    res.json(updatedPost);
                } else {
                    // If the post with the given ID was not found
                    res.status(404).json({ error: 'Post not found' });
                }
            } catch (error) {
                // If an error occurred during the update process
                console.error('Error updating post:', error);
                res.status(500).json({ error: 'Internal server error' });
            }

    });
    
});



// Endpoint to delete a post from the database
app.delete("/delete/:id", async (req, res) => {
    const postId = req.params.id;
    try {
        // Find the post by ID and delete it
        const deletedPost = await Post.findByIdAndDelete(postId);
        if (!deletedPost) {
            // If no post is found with the given ID, return a 404 Not Found error
            return res.status(404).json({ error: 'Post not found' });
        }
        // If the post is successfully deleted, return a 200 OK response
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        // If an error occurs during the deletion process, return a 500 Internal Server Error
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



//connect to database
mongoose.connect('mongodb+srv://shyamvaradharajan200:Gops123!@cluster0.igocnz6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .catch( (err) => {
        console.log("Could not connect to database");
        console.log({err:err.message});
    })
    .then(() => {
        console.log("Connected to database");
    });


//mongodb+srv://shyamvaradharajan200:Gops123!@cluster0.igocnz6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
app.listen(4000, () => {
    console.log("Server connected to port 4000");
});