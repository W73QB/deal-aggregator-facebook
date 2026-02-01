// Environment variable checker for MCP diagnosis
console.log('🔍 Environment Variables Check:');
console.log('================================');

const maskPassword = (url) => {
  if (!url) return 'undefined';
  return url.replace(/:\/\/[^:]*:[^@]*@/, '://****:****@');
};

console.log('POSTGRES_URL:', maskPassword(process.env.POSTGRES_URL));
console.log('DATABASE_URL:', maskPassword(process.env.DATABASE_URL));
console.log('DATABASE_URL_POOLER:', maskPassword(process.env.DATABASE_URL_POOLER));
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');

console.log('\n🔍 Full Environment Variable List (filtered):');
Object.keys(process.env)
  .filter(key => key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('URL'))
  .sort()
  .forEach(key => {
    const value = process.env[key];
    if (value && value.includes('postgres://')) {
      console.log(`${key}:`, maskPassword(value));
    } else {
      console.log(`${key}:`, value);
    }
  });