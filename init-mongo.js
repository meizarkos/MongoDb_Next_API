db.createUser(
   {
       user: "alexis",
       pwd: "alexis",
       roles: [
           {
               role: "readWrite",
               db: "my_db"
           }
       ]
   }
);
db.createCollection("users");
db.createCollection("todos");
