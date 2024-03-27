db.createUser(
  {
      user: "alexis",
      pwd: "alexis",
      roles: [
          {
              role: "readWrite",
              db: "Univ-express"
          }
      ]
  }
);
db.createCollection("users");