const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb+srv://spaceDBuser:Pjufp3M8SBiGYZXP@cluster1-wjvck.azure.mongodb.net/spaceDB?retryWrites=true&w=majority';
const client = new MongoClient(url, { useNewUrlParser: true });
const dbName = "spaceDB";

let playerName = 'Twan';
  // Set initial state of the game
let state = {fuel: 100, minerals: 0 , planet: 'Earth', flag:'NO'};

async function run() {
    try {
        await client.connect();
        console.log ("Connected correctly to mongoDB server");
        const db = client.db(dbName);

        //Use the collection "state"
        const col = db.collection("state");

        //Find one document
        const userstate = await col.findOne(
          { username: playerName }
        );

        state = userstate;
        console.log(userstate);
        console.log(`${playerName}'s minerals is: ${state.minerals} `);

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
