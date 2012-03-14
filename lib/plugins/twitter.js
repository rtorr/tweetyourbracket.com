var util = require('util'),
    twitter = require('twitter'),
    _ = require('underscore'),
    validator = require('./validator.js'),
    pg = require('pg'),
    NCAA = require('../data/2012.json'),
    stopTime = new Date(Date.parse(NCAA.closingTime)),
    twitter_keys = {};
    
require('date-utils');
    
if (!process.env.TWITTER_CONSUMER_KEY) {
  twitter_keys = require('../data/twitter.json');
} else {
  twitter_keys = {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  };
}

// REMOVE
var pg = require('pg').native, connectionString = process.env.DATABASE_URL, client, query;
client = new pg.Client(connectionString);
client.connect();
client.query('DROP TABLE IF EXISTS brackets');
query = client.query('CREATE TABLE brackets (username varchar(50) NOT NULL, bracket varchar(140) NOT NULL, score integer DEFAULT 0, userid varchar(25) NOT NULL, tweetid varchar(25) PRIMARY KEY, date date)');
query.on('end', function() { client.end(); });
// REMOVE

var twit = new twitter(twitter_keys);

twit.stream('statuses/filter', {track: '#tybrkt'}, function(stream) {
  stream.on('data', function(data) {
    
    var validHash = _.find(_.without(_.pluck(data.entities.hashtags, 'text'), 'tybrkt'), function(ht) {
          return (validator.validateTournament(ht, false, true) !== false);
        }),
        tweetDate = new Date(Date.parse(data.created_at));
    
    
    if (validHash && Date.compare(tweetDate, stopTime) === -1) {
      
      var validData = {
        created_at: tweetDate,
        bracket: validHash,
        userid: data.user.id_str,
        tweetid: data.id_str,
        username: data.user.screen_name.toLowerCase()
      };
      
      pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (!err) {
          var query = client.query('INSERT INTO brackets (bracket, userid, tweetid, username, date) VALUES ($1, $2, $3, $4, $5)', [
            validData.bracket,
            validData.userid,
            validData.tweetid,
            validData.username,
            validDate.created_at
          ]);
        }
      });
    }
    
  });
});