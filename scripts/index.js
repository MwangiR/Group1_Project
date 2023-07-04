const clientId = '07574a44bbef47ad9c5b4949cf020c29';
const clientSecret = '3a121714103f4ebbbe8a1d88a0e5fa8c';
const redirectUri = 'https://alexanderduncan1.github.io/Group1_Project/';

function authenticate() {
  const state = generateRandomString(16);
  localStorage.setItem('spotify_auth_state', state);

  // Construct the authorization URL
  const authorizeUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

  // Redirect the user to Spotify's authorization endpoint
  window.location.href = authorizeUrl;
}

// Handle the callback logic
function handleCallback() {
  // Extract the query parameters from the callback URL
  const query = window.location.search.substring(1);
  const params = new URLSearchParams(query);

  // Retrieve the authorization code and state from the query parameters
  const code = params.get('code');
  const state = params.get('state');

  // Verify the state to prevent CSRF attacks
  const storedState = localStorage.getItem('spotify_auth_state');
  localStorage.removeItem('spotify_auth_state'); // Remove the stored state to prevent reusing it

  if (state === null || state !== storedState) {
    console.error('Invalid state parameter.');
    return;
  }

  // Make a POST request to exchange the authorization code for an access token
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const data = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret
  });

  fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: data
  })
    .then(response => response.json())
    .then(data => {
      // Handle the response from the token endpoint
      const accessToken = data.access_token;
      const expiresIn = data.expires_in;

      // Perform actions with the access token (e.g., call Spotify Web API)
      console.log('Access Token:', accessToken);
      console.log('Expires In:', expiresIn);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

// Generate a random string of a given length
function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Call the handleCallback function when the page is loaded
window.addEventListener('DOMContentLoaded', handleCallback);

