const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://localhost:3001/predictions', { text: 'Je man', language: 'fr' });
    console.log(res.data);
  } catch (e) {
    console.error(e.response?.data || e.message);
  }
}
test();
