const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash('password123', 10);
console.log(hashedPassword);