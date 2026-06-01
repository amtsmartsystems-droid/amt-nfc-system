const fetch = require('node-fetch');

async function testToken() {
  const res = await fetch('http://localhost:3000/api/blob-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'blob.generate-client-token',
      payload: {
        pathname: 'menus/test.pdf',
        contentType: 'application/pdf',
        clientPayload: null,
        multipart: false
      }
    })
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

testToken();
