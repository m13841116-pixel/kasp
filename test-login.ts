import { initDb, queryOne } from './src/server/db';
import bcrypt from 'bcryptjs';

async function test() {
  await initDb();
  const user = queryOne("SELECT * FROM users WHERE email = ?", ['admin@kasp.ir']);
  console.log('User found:', !!user);
  if (user) {
    console.log('Password hash:', user.password);
    const match = bcrypt.compareSync('123456', user.password);
    console.log('Password match:', match);
  }
}
test();
