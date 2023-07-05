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

// Function to fetch user's playlists and extract artists from each playlist
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
      const playlistArtists = [];

      // Iterate over each playlist
      for (const playlist of playlists) {
        const playlistName = playlist.name;
        console.log('Playlist:', playlistName);

        // Get the playlist's tracks
        const playlistId = playlist.id;
        getPlaylistTracks(accessToken, playlistId)
          .then(tracks => {
            // Extract artists from each track in the playlist
            const artists = tracks.flatMap(track => track.track.artists.map(artist => artist.name));
            console.log('Artists in Playlist:', artists);

            // Add artists to the playlistArtists array
            playlistArtists.push(...artists);
          })
          .catch(error => {
            console.error('Error:', error);
          });
      }

      console.log('All Playlist Artists:', playlistArtists);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

// Function to fetch a playlist's tracks
function getPlaylistTracks(accessToken, playlistId) {
  return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
    .then(response => response.json())
    .then(data => {
      // Response contains the playlist's tracks
      return data.items;
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

// ----------------------------------------------------------------------------
// Discovery API Section

// geolocation
let userLocation = "";
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

=======
function showPosition(position) {
  userLocation = (position.coords.latitude + position.coords.longitude);
  console.log(position.coords.latitude, position.coords.longitude);
}
// can add error correction in here later


// fetch request 
let radius = 50;

const apiKey = "eseLXtPfRbVGKGyJSqbCSi9iaudaWTws";
const modifiedUrl = "https://app.ticketmaster.com/discovery/v2/events.json?latlong=" + `${userLocation}` + "&radius=" + `${radius}` + "&unit=km" + "&apikey=" + `${apikey}`;
//const requestUrl = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=" + `${apikey}`;

fetch(modifiedUrl)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    console.log(data);
    // Parse the response.
    // Do other things.
  })
  .catch(err => {
    // This time, we do not end up here!
  });



//-------------------------------------------------------------------
//jquery section
$(function () {
  function modalDiv() {
    const modalDiv = $("<div>")
      .addClass("reveal")
      .attr({
        id: "Modal",
        "data-reveal": "",
      })
      .append(
        $("<h2>").text("This is a modal"),
        $("<button>")
          .addClass("close-button")
          .attr({
            "data-close": "",
            "aria-label": "Close modal",
            type: "button",
          })
          .append($("<span>").attr("aria-hidden", "true").html("&times")),
      );

    $("body").append(modalDiv);
    $(document).foundation();
  }

  const clickableBtn = $(".showModal");

  clickableBtn.on("click", function (e) {
    e.preventDefault();
    modalDiv();
    console.log("clicked");
  });
  $(document).foundation();
});
