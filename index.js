//import
const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");

//constant
const PORT = process.env.PORT || 8080;

//Showdown
const showdown = require("showdown"),
  converter = new showdown.Converter();

//connect to database
try {
  mongoose.connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.${process.env.DB_ID}.mongodb.net/blogs?retryWrites=true&w=majority`
  );
  console.log("Connected to database");
} catch (e) {
  console.log(e);
}
//use static file
app.use(express.static("./public"));

//helper
function getHash(input) {
  var hash = 0,
    len = input.length;
  for (var i = 0; i < len; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // to 32bit integer
  }
  return hash;
}

//Model
//Blog model
const Blogs = new mongoose.model(
  "blogs",
  new mongoose.Schema({
    image: String,
    title: String,
    description: String,
    content: String,
    id: String,
  })
);

//routing
//[GET] / All: Index page
app.get("/", async (req, res) => {
  //render home
  return res.sendFile(__dirname + "/views/home.html");
});

//[GET] /blogs All: get blogs data
app.get("/blogs", async (req, res) => {
  let blogs;
  try {
    blogs = await Blogs.find({}).lean();
  } catch (e) {
    //error handle
    return res.status(500).json({
      message: "Internal error",
      success: false,
    });
  }
  if (blogs) {
    return res.json({
      success: true,
      data: blogs,
    });
  }

  return res.status(404).json({
    success: false,
    message: "404",
  });
});

//[GET] /blog/:id : get blog data
app.get("/blog/:id", async (req, res) => {
  let blog;
  try {
    blog = await Blogs.findOne({ id: req.params.id });
    if (!blog) {
      return res.redirect("/");
    }
  } catch (e) {
    //error handle
    //redirect to home page
    return res.redirect("/");
  }

  return res.json({
    success: true,
    data: {
      title: blog.title,
      content: converter.makeHtml(blog.content),
    },
  });
});

//[GET] /:id All: blog view page
app.get("/:id", async (req, res) => {
  let blog;
  try {
    blog = await Blogs.findOne({ id: req.params.id });
    if (!blog) {
      return res.redirect("/");
    }
  } catch (e) {
    //error handle
    //redirect to home page
    return res.redirect("/");
  }

  return res.sendFile(__dirname + "/views/blog.html");
});

//app listen
app.listen(PORT, () => console.log("App is running at port:", PORT));
