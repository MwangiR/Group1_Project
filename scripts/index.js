function authenticate() {
  const clientId = '07574a44bbef47ad9c5b4949cf020c29';
  const clientSecret = 'Zander85';

  const authEndpoint = 'https://accounts.spotify.com/authorize';
  const redirectUri = 'https://alexanderduncan1.github.io/Group1_Project/';
  const scopes = 'user-library-read playlist-read-private';

  // Redirect the user to Spotify's authorization endpoint
  window.location.href = `${authEndpoint}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
}

// Handle the redirect URI after the user grants permission
window.addEventListener('load', function() {
  const code = new URLSearchParams(window.location.search).get('code');
  if (code) {
    const clientId = '07574a44bbef47ad9c5b4949cf020c29';
    const clientSecret = 'Zander85';
    const tokenEndpoint = 'https://accounts.spotify.com/api/token';
    const redirectUri = 'https://alexanderduncan1.github.io/Group1_Project/';

    // Exchange the authorization code for an access token
    fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
      },
      body: new URLSearchParams({
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirectUri
      })
    })
    .then(response => response.json())
    .then(data => {
      const accessToken = data.access_token;
      
      // Use the access token to make API requests and retrieve artist data
      getArtistData(accessToken);
      getPlaylistData(accessToken);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
});

function getArtistData(accessToken) {
  // Make API request to retrieve user's library data
  fetch('https://api.spotify.com/v1/me/tracks', {
    headers: {
      'Authorization': 'Bearer ' + accessToken
    }
  })
    .then(response => response.json())
    .then(data => {
      // Extract and display artist information in a list
      const artistList = document.getElementById('artistList');
      artistList.innerHTML = '<h2>Artists in Your Library:</h2><ul>';

      const artists = data.items.map(item => item.track.artists.map(artist => artist.name));
      artists.forEach(artist => {
        artistList.innerHTML += `<li>${artist}</li>`;
      });

      artistList.innerHTML += '</ul>';
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function getPlaylistData(accessToken) {
  // Make API request to retrieve user's playlists
  fetch('https://api.spotify.com/v1/me/playlists', {
    headers: {
      'Authorization': 'Bearer ' + accessToken
    }
  })
    .then(response => response.json())
    .then(data => {
      // Extract and display playlist information in a list
      const playlistList = document.getElementById('playlistList');
      playlistList.innerHTML = '<h2>Your Playlists:</h2><ul>';

      const playlists = data.items.map(item => item.name);
      playlists.forEach(playlist => {
        playlistList.innerHTML += `<li>${playlist}</li>`;
      });

      playlistList.innerHTML += '</ul>';
    })
    .catch(error => {
      console.error('Error:', error);
    });
}