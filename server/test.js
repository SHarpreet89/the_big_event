import bcrypt from 'bcrypt';

const password = 'password123';
console.log('Plain text password:', password);

const hashedPassword = await bcrypt.hash(password, 10);
console.log('Hashed password:', hashedPassword);

const test = await bcrypt.compare(password, hashedPassword);

console.log(`bcrypt Test ${test}`);
