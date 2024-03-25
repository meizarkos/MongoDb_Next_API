import mongoose from "mongoose";

const username = "anon"
const password = "marbleCake"
const host = "localhost"
const port = "27017"
const database = "my_db"

const db = mongoose.connect(`mongodb://${username}:${password}@${host}:${port}/${database}`).then(()=>{console.log("Lancé")});

export const startOfDatabase = async () => {
  db.then(() => {
          console.log('Database and tables have been synchronized');
      })
      .catch((err: Error) => {
          console.error('An error occurred while synchronizing the database:', err);
      });
};