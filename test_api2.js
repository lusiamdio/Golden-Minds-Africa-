async function runNativeFetch() {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': 'perplexity2.p.rapidapi.com',
      'x-rapidapi-key': 'cd707cd18emsha46a78d1c51103cp11a3eajsn047d42571f12'
    },
    body: '{"content":"What is todays news in america?"}'
  };
  try {
      const response = await fetch('https://perplexity2.p.rapidapi.com/', options);
      const data = await response.text();
      console.log(data);
  } catch(e) { console.error(e); }
}

runNativeFetch();
