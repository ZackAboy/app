const axios = require('axios');

const clientId = '51c385609af1d32914f6';
const clientSecret = 'b54f7364d251e595313af61d6ed705af';

let token = null;
let expireAt = 0;

async function getToken() {
    const currentTime = Date.now() / 1000;
    if (!token || currentTime >= expireAt) {
        const response = await axios.post('https://api.artsy.net/api/tokens/xapp_token', {
            client_id: clientId,
            client_secret: clientSecret
        });

        token = response.data.token;
        expireAt = Date.parse(response.data.expires_at) / 1000;
    }
    return token;
}

module.exports = { getToken };