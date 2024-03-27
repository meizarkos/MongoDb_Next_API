import mongoose from "mongoose";

const host = "localhost"
const port = "27017"
const database = "univ-express"

const db = mongoose.connect(`mongodb://${host}:${port}/${database}`);

export const startOfDatabase = async () => {
  db.then(() => {
          console.log('Database and tables have been synchronized');
      })
      .catch((err: Error) => {
          console.error('An error occurred while synchronizing the database:', err);
      });
};