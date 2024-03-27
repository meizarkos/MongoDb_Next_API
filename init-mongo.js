db.createUser(
  {
      user: "alexis",
      pwd: "alexis",
      roles: [
          {
              role: "readWrite",
              db: "univ_express"
          }
      ]
  }
);
db.createCollection("users");