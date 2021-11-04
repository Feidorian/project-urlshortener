require('dotenv').config();
const express = require('express');

const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();
app.use(bodyParser.urlencoded({extended:true}))



// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


const db = {};

function urlIsValid(url) {
  return new Promise((resolve, reject) => {
    let [,pref,site,tail] = url.match(/(.*\/\/)(.*)(\/\?.*)/);
    dns.lookup(site, (err, t, __) => {
      err? reject() : resolve(pref+site+tail);
    })
  })
}

app.post("/api/shorturl", (req,res) => {
  let {url} = req.body;
  urlIsValid(url)
  .then((data)=> {
    let short_url =  Object.keys(db).length+1;
    let original_url = data;
    db[short_url] = {original_url, short_url};
    res.json({original_url, short_url})
  })
  .catch(()=> res.json({"error":"invalid url"}))
});

app.get("/api/shorturl/:short_url", (req, res) => {
  let {short_url} = req.params;
  let redirect = db[short_url].original_url
  res.redirect(redirect)
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
