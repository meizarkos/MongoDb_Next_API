import express from "express";
import bodyParser from "body-parser";
import jwt from "jwt-express";
import bcrypt from "bcrypt";

import { startOfDatabase } from "./utils/db_handler";
import { routerArtistes } from "./artistes/route";
import { routerMaquette } from "./maquette/route";
import { routerManager } from "./manager/route";
import { routerUsers } from "./users/route";
import { User } from "./users/model";
import { errorHandler } from "./utils/error_handler";
import { keyToken } from "./utils/jwt";

async function createDefaultAdmin() {
    const adminExists = await User.findOne({ role: "admin" });

    if (!adminExists) {
        const adminPassword = "defaultAdminPassword"; 
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        const adminUser = new User({
            email: "admin@example.com",
            password: hashedPassword,
            salt: salt,
            role: "admin",
            createdAt: new Date()
        });

        await adminUser.save();
        console.log("Default admin account created.");
    }
}

startOfDatabase().then(() => {
    createDefaultAdmin(); 
});

const app = express();

app.use(bodyParser.json());
app.use(jwt.init(keyToken, { cookies: false }));

app.get("/", (_req, res) => {
    res.json({ message: "The API is working"});
});

app.use(routerArtistes);
app.use(routerManager);
app.use(routerMaquette);
app.use(routerUsers);

app.use((_req, res) => {
    res.status(404).json({ message: "This route does not exist" });
});

app.use(errorHandler);

app.listen(3000, () => {
    console.log("listening on port 3000!");
});
