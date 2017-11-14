var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './static')));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost/MessageDB');
var Schema = mongoose.Schema;

var PostSchema = new mongoose.Schema({
    name : {type: String, required: true},
    text: { type:String, required: true},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
   },{
       timestamps : true
   })
mongoose.model('Post', PostSchema); 
var Post = mongoose.model('Post'); 

var CommentSchema = new mongoose.Schema({
    name : {type: String, required: true},
    _post: {type: Schema.Types.ObjectId, ref: 'Post'},
    text : {type: String, required: true}
    }, {
        timestamps: true
    });
mongoose.model('Comment', CommentSchema);
var Comment = mongoose.model('Comment');

app.get('/', function(req, res) {
    
    Post.find({}).populate('comments')
    .exec(function(err, posts){
        if(err){
            console.log('something went wrong');
        }
        else{
            console.log('successfully displayed all the messages!');
            res.render('index', {posts : posts});  
        }    
    })
})

app.post('/posts', function(req, res) {
    console.log("POST DATA", req.body);
    var post = new Post({name : req.body.name, text: req.body.message});
    post.save(function(err){
        if(err) {
            console.log('something went wrong');
        } 
        else { 
            console.log('successfully added info!');
            res.redirect('/');
        }
    })
})

app.post('/posts/:id', function(req, res){
    Post.findOne({_id: req.params.id}, function(err, post){
        var comment = new Comment({
            name: req.body.comment_name,
            _post : post._id,
            text: req.body.comment,
        });
        comment.save(function(err){
            post.comments.push(comment);
                post.save(function(err){
                    if(err){
                        console.log("Error");
                    }
                    else{
                        console.log("comment added...");
                        res.redirect('/');
                    }
            });
        });
    });
});


app.listen(8000, function() {
    console.log("listening on port 8000");
})