const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();
const workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

const itemsSchema = {
    name: String
}

const Item = mongoose.model("Item", itemsSchema );

const item1 = new Item({
    name:'Welcome to your todo list'
})
const item2 = new Item({
    name:'Hit the + button add a new item'
})

const item3 = new Item({
    name:'Hit this to delete an item'
})

const defaultItems = [item1,item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema );

app.get('/', function(req, res){
    Item.find().then((items) =>{
        if(items.length === 0)  {
            Item.insertMany(defaultItems).then(() =>{
            console.log('item successfully saved');
            });
            res.redirect('/');
        } else {
        res.render('list', {listTitle: 'Today', newListItems: items})
        }
            })
})

app.get('/:customListName', function(req, res){
 console.log(req.params.customListName);
 const customListName = _.capitalize(req.params.customListName);
 List.findOne({name: customListName}).then((foundList) =>{
if(!foundList){
    console.log('doesnot exist')
    const list = new List({
        name: customListName,
        items: defaultItems
     })

     list.save();
    res.redirect('/' + customListName);
} else{
    console.log(' exist')
    res.render('list', {listTitle: foundList.name, newListItems: foundList.items})
}
 })
 


//  list.save();
})

app.post('/', function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    })

   
    if(listName === 'Today'){
        item.save();
        res.redirect('/');
    } else{
     List.findOne({name: listName}).then((foundList) =>{
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName) 
     })
    }
})

app.post('/delete', function(req, res){
console.log(req.body.checkbox)
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === 'Today') {
        Item.findByIdAndRemove(checkedItemId).then(()=>{console.log('Item deleted');})
        res.redirect('/');
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then((err, foundList)=>{
        res.redirect('/' + listName);
        })
    }
})

app.get('/work', function(req, res){
    res.render('list', {listTitle: 'Work List', newListItems: workItems}); 
});

app.post('/work', function(req, res){
    const item = req.body.newItem;
    
    workItems.push(item);
    
    res.redirect('/work')
});


app.listen(3000, function(){
    console.log('Server is running on the port 3000');
})
