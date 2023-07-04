const clientId = '07574a44bbef47ad9c5b4949cf020c29';
const redirectUri = 'https://alexanderduncan1.github.io/Group1_Project/';
const clientSecret = '3a121714103f4ebbbe8a1d88a0e5fa8c';

// Function to handle user authentication and authorization
function authenticate() {
  const state = generateRandomString(16);
  localStorage.setItem('spotify_auth_state', state);

  const scope = 'playlist-read-private playlist-read-collaborative user-library-read'; // Add the required scopes here

  const authorizeUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

  // Redirect to Spotify's authorization endpoint
  window.location.href = authorizeUrl;
}

// Function to handle callback after user authorization
function handleCallback() {
  // Extract the query parameters from the callback URL
  const query = window.location.search.substring(1);
  const params = new URLSearchParams(query);

  // Get authorization code and state
  const code = params.get('code');
  const state = params.get('state');

  // Verify the state and secure
  const storedState = localStorage.getItem('spotify_auth_state');
  if (!state || state !== storedState) {
    console.error('Invalid state parameter.');
    return;
  }

  // Clear the stored state
  localStorage.removeItem('spotify_auth_state');

  // POST request to swap the authorization code for an access token
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const data = {
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret
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
      // Response from the token endpoint
      const accessToken = data.access_token;

      // Log the access token for debugging
      console.log('Access Token:', accessToken);

      // Use the access token to fetch user's playlists and library
      getUserPlaylists(accessToken);
      getUserLibraryArtists(accessToken);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

// Function to fetch user's playlists
function getUserPlaylists(accessToken) {
  fetch('https://api.spotify.com/v1/me/playlists', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
    .then(response => response.json())
    .then(data => {
      // Response contains the user's playlists
      const playlists = data.items;

      // Iterate over each playlist
      for (const playlist of playlists) {
        const playlistName = playlist.name;
        console.log('Playlist:', playlistName);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

// Function to fetch user's library artists
function getUserLibraryArtists(accessToken) {
  fetch('https://api.spotify.com/v1/me/tracks', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
    .then(response => response.json())
    .then(data => {
      // Response contains the user's library tracks
      const libraryTracks = data.items;

      // Extract unique artists from the library tracks
      const libraryArtists = [...new Set(libraryTracks.flatMap(track => track.track.artists.map(artist => artist.name)))];

      // Log the library artists
      console.log('Library Artists:', libraryArtists);
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

