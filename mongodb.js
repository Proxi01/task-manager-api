// const mongodb = require("mongodb");
// const MongoClient = mongodb.MongoClient;
// const ObjectID = mongodb.ObjectID;

const { MongoClient, ObjectID } = require("mongodb");

const connectionURL = "mongodb://127.0.0.1:27017";
const databaseName = "task-manager";

MongoClient.connect(
  connectionURL,
  {
    useNewUrlParser: true,
  },
  (error, client) => {
    if (error) {
      return console.log("Unable to connect to database");
    }

    const db = client.db(databaseName);

    db.collection("users")
      .updateMany(
        {
          _id: setTimeout(() => new ObjectID("5ebc49df6bc0fca7e7083aa6"), 2000),
        },
        {
          $set: {
            age: 11,
          },
        }
      )
      .then((result) => {
        console.log("Updated");
      })
      .catch((error) => {
        console.log(error);
      });

    db.collection("users")
      .deleteOne({
        age: 11,
      })
      .then((result) => console.log("Deleted"))
      .catch((error) => console.log(error));
  }
);
