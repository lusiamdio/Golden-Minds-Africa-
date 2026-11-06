const fetch = require('node-fetch');

async function test() {
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
    // using dynamic import for node-fetch is needed for newer versions, but we can try native fetch
    const response = await वैश्विकFetch('https://perplexity2.p.rapidapi.com/', options);
    const data = await response.text();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

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
  const response = await fetch('https://perplexity2.p.rapidapi.com/', options).catch(e => console.log(e));
  if(response) {
      const data = await response.text();
      console.log(data);
  }
}

runNativeFetch();
