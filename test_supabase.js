import https from 'https';

https.get('https://xstbuiishcldznuusshw.supabase.co', (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);
}).on('error', (e) => {
  console.error(e);
});
