import mongoose from "mongoose";

const username = "alexis"
const password = "alexis"
const host = "localhost"
const port = "27017"
const database = "Univ-express"

const db = mongoose.connect(`mongodb://${username}:${password}@${host}:${port}/${database}`);

export const startOfDatabase = async () => {
  db.then(() => {
          console.log('Database and tables have been synchronized');
      })
      .catch((err: Error) => {
          console.error('An error occurred while synchronizing the database:', err);
      });
};