import bcrypt from "bcryptjs";

const salt = bcrypt.genSaltSync(4);
const hash = bcrypt.hashSync("password",salt);

console.log(hash);