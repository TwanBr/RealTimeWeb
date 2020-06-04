const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb+srv://TwanBr:6W9nj8t%40K9@cluster1-wjvck.azure.mongodb.net/spaceDB?retryWrites=true&w=majority';
const client = new MongoClient(url);

async function run() {
    try {
        await client.connect();
        console.log("Connected correctly to server");

    } catch (err) {
        console.log(err.stack);
    }
    finally {
        await client.close();
    }
}

run().catch(console.dir);

/*
// Database Name
const dbName = 'myproject';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  client.close();
});
*/
