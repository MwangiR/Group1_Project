var clientId = '07574a44bbef47ad9c5b4949cf020c29';
var redirectUri = 'https://alexanderduncan1.github.io/Group1_Project/';

function authenticate() {
  var state = generateRandomString(16);
  localStorage.setItem('spotify_auth_state', state);

  // Construct the authorization URL
  var authorizeUrl = 'https://accounts.spotify.com/authorize?' +
    'response_type=code' +
    '&client_id=' + clientId +
    '&redirect_uri=' + encodeURIComponent(redirectUri) +
    '&state=' + state;

  // Redirect the user to Spotify's authorization endpoint
  window.location.href = authorizeUrl;
}

// Handle the callback logic
function handleCallback() {
  // Extract the query parameters from the callback URL
  var query = window.location.search.substring(1);
  var params = new URLSearchParams(query);

  // Retrieve the authorization code and state from the query parameters
  var code = params.get('code');
  var state = params.get('state');

  // Verify the state to prevent CSRF attacks
  var storedState = localStorage.getItem('spotify_auth_state');
  if (state === null || state !== storedState) {
    console.error('Invalid state parameter.');
    return;
  }

  // Clear the stored state
  localStorage.removeItem('spotify_auth_state');

  // Make a POST request to exchange the authorization code for an access token
  var tokenUrl = 'https://accounts.spotify.com/api/token';
  var data = {
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: 'YOUR_CLIENT_SECRET' // Replace with your client secret
  };

  fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(data)
  })
  .then(response => response.json())
  .then(data => {
    // Handle the response from the token endpoint
    var accessToken = data.access_token;
    var expiresIn = data.expires_in;

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
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Call the handleCallback function when the page is loaded
window.addEventListener('DOMContentLoaded', handleCallback);
