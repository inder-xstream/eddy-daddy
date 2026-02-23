const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function resetUser() {
  const p = new PrismaClient();
  
  const email = 'spadmin@stepgne.com'; // Change to your email
  const newPassword = 'Test@1234';      // Known test password
  
  const hashed = await bcrypt.hash(newPassword, 12);
  
  // Verify hash works immediately
  const verify = await bcrypt.compare(newPassword, hashed);
  console.log('Hash self-verify:', verify);
  
  const user = await p.user.update({
    where: { email },
    data: { 
      password: hashed,
      isVerified: true,  // Also mark as verified so login completes
    },
    select: { email: true, isVerified: true }
  });
  
  console.log('Updated user:', user);
  console.log('New password:', newPassword);
  console.log('You can now log in with these credentials.');
  
  await p.$disconnect();
}

resetUser().catch(console.error);
