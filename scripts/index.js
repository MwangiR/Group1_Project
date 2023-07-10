const clientId = "07574a44bbef47ad9c5b4949cf020c29";
const redirectUri = "https://alexanderduncan1.github.io/Group1_Project/";
const clientSecret = "3a121714103f4ebbbe8a1d88a0e5fa8c";



// Function to handle user authentication and authorization
function authenticate() {
  const state = generateRandomString(16);
  localStorage.setItem("spotify_auth_state", state);

  const scope = "playlist-read-private playlist-read-collaborative user-library-read"; // Add the required scopes here                            

  const authorizeUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&state=${state}&scope=${encodeURIComponent(scope)}`;

  // Redirect to Spotify's authorization endpoint
  window.location.href = authorizeUrl;
}

// Function to handle callback after user authorization
function handleCallback() {
  // Extract the query parameters from the callback URL
  const query = window.location.search.substring(1);
  const params = new URLSearchParams(query);

  // Get authorization code and state
  const code = params.get("code");
  const state = params.get("state");

  // Verify the state and secure
  const storedState = localStorage.getItem("spotify_auth_state");
  if (!state || state !== storedState) {
    return;
  }

  // Clear the stored state
  localStorage.removeItem("spotify_auth_state");

  // POST request to swap the authorization code for an access token
  const tokenUrl = "https://accounts.spotify.com/api/token";
  const data = {
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  };

  fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(data),
  })
    .then((response) => response.json())
    .then((data) => {
      // Response from the token endpoint
      const accessToken = data.access_token;

      // Log the access token for debugging
      console.log("Access Token:", accessToken);

      // Use the access token to fetch user's playlists and library
      getUserPlaylists(accessToken);
      getUserLibraryArtists(accessToken);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Function to fetch user's playlists and extract artists from each playlist
function getUserPlaylists(accessToken) {
  fetch("https://api.spotify.com/v1/me/playlists", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // Response contains the user's playlists
      const playlists = data.items;
      const allArtists = [];

      // Iterate over each playlist
      const fetchPromises = playlists.map((playlist) => {
        const playlistId = playlist.id;
        return getPlaylistTracks(accessToken, playlistId)
          .then((tracks) => {
            // Extract artists from each track in the playlist
            const artists = tracks.flatMap((track) =>
              track.track.artists.map((artist) => artist.name),
            );
            //console.log("Artists in Playlist:", artists);

            // Add artists to the allArtists array
            allArtists.push(...artists);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      });

      // Wait for all the fetch promises to resolve
      Promise.all(fetchPromises)
        .then(() => {
          // Combine all the arrays and remove duplicates
          const uniqueArtists = [...new Set(allArtists)];
          console.log("All Playlist Artists:", uniqueArtists);
          //applyToDom(uniqueArtists);
          uniqueSpotifyArtists = uniqueArtists;

          // Call a function here to generate a list or perform any other operation with the uniqueArtists array
          generateArtistList(uniqueArtists);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Function to fetch a playlist's tracks
function getPlaylistTracks(accessToken, playlistId) {
  return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // Response contains the playlist's tracks
      return data.items;
    });
}

// Function to fetch user's library artists
function getUserLibraryArtists(accessToken) {
  fetch("https://api.spotify.com/v1/me/tracks", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // Response contains the user's library tracks
      const libraryTracks = data.items;

      // Extract unique artists from the library tracks
      const libraryArtists = [
        ...new Set(
          libraryTracks.flatMap((track) => track.track.artists.map((artist) => artist.name)),
        ),
      ];

      //-----------------------------
      //display to dom
      //applyToDom(libraryArtists);
      //----------------------------

      // Log the library artists
      //console.log("Library Artists:", libraryArtists);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Generate a random string of a given length
function generateRandomString(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Function to generate the artist list or perform any other operation with the uniqueArtists array
function generateArtistList(artists) {
  // Here, you can create the list using the artists array and perform any desired operation
  // For example, you can append the artists to an HTML element on your page or create a formatted string

  // Example: Creating an unordered list of artists
  const artistList = document.createElement("ul");
  artists.forEach((artist) => {
    const artistItem = document.createElement("li");
    artistItem.textContent = artist;
    artistList.appendChild(artistItem);
  });

  // Append the artist list to a specific element on your page
  const container = document.querySelector(".artist-list-container");
  container.appendChild(artistList);
}

// Call the handleCallback function when the page is loaded
window.addEventListener("DOMContentLoaded", handleCallback);

//-------------------------------------------------------------------
//apply to dom function

function applyToDom(playlistObj) {
  const playlistEL = document.querySelector("#updateContent"); //edit
  playlistEL.innerHTML = "";
  const ulContainerEl = document.createElement("ul");


  playlistObj.forEach((artist) => {
    const artistLiEL = document.createElement("li");
    artistLiEL.textContent = artist;
    //add search for ticket button here
    const ticketEL = document.createElement("button");
    ticketEL.classList.add('button');
    ticketEL.classList.add('this-button');
    ticketEL.textContent = "Search for Tickets";
    ticketEL.addEventListener("click", function (event) {
      // generate tickets      
      console.log(event);
      let thisArtist = event.target.parentNode.firstChild.textContent;
      specificArtist = thisArtist;
      event.preventDefault();
      getLocation();
      getTickets();

    })

    artistLiEL.appendChild(ticketEL);
    ulContainerEl.appendChild(artistLiEL);
  });

  playlistEL.appendChild(ulContainerEl);
}
//jquery section
$(function () {
  function showNotify(text, color, element) {
    const notifyContainer = $("<div>")
      .attr({
        class: `${color} callout`,
        style: "width:300px; position:absolute; right:0; top:10%; left:5%;",
      })
      .append($("<h5>").text(`${text}`));

    $(`${element}`).append(notifyContainer);

    setTimeout(function () {
      notifyContainer.remove();
    }, 3000);
  }
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
    //modalDiv();
    showNotify("this is a warning", "success", "body");
    console.log("clicked");
  });
  $(document).foundation();
});

// --------------------------------------------------------------------------------------------------------------------------------------
// Discovery API Section

// empty array for initial fetch request data
let uniqueSpotifyArtists = undefined;
let initialDataArrayResults = [];
let uniqueArrayResults = [];
let crossCheckedArray = [];


// function to compare the 2 unique arrays
function findCommonElement(uniqueArrayResults, uniqueSpotifyArtists) {
  // Loop for array 1
  for (let i = 0; i < uniqueArrayResults.length; i++) {
    // Loop for array 2
    for (let j = 0; j < uniqueSpotifyArtists.length; j++) {
      // Compare the element of each and every element from both of the arrays
      if (uniqueArrayResults[i] === uniqueSpotifyArtists[j]) {
        crossCheckedArray.push(uniqueArrayResults[i]);
      }
    }
  }
}


// generate cross checked list results
const generateContent = document.querySelector("#generateList");
generateContent.addEventListener("click", function (event) {
  //console.log(event);
  event.preventDefault();
  getLocation();
  //initialArtists(); //moved from showPosition() might not work, might need to wait
});


// get geolocation
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    var x = document.getElementById("location");
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}


// get latitude and longitude
let latlon = "";
let mapLat = 0;
let mapLon = 0;
function showPosition(position) {
  latlon = position.coords.latitude + "," + position.coords.longitude;
  mapLat = position.coords.latitude;
  mapLon = position.coords.longitude;
  console.log(position);
  initialArtists();
};


// show errors
function showError(error) {
  var x = document.getElementById("location");
  switch (error.code) {
    case error.PERMISSION_DENIED:
      x.innerHTML = "User denied the request for Geolocation.";
      break;
    case error.POSITION_UNAVAILABLE:
      x.innerHTML = "Location information is unavailable.";
      break;
    case error.TIMEOUT:
      x.innerHTML = "The request to get user location timed out.";
      break;
    case error.UNKNOWN_ERROR:
      x.innerHTML = "An unknown error occurred.";
      break;
  }
}


// initial fetch to get all tickets for music gigs within a radius of the user location
function initialArtists() {
  var getAllUrl =
    "https://app.ticketmaster.com/discovery/v2/events.json?classificationName=music&apikey=eseLXtPfRbVGKGyJSqbCSi9iaudaWTws&latlong=" +
    latlon +
    "&radius=10&size=200"; //added size constraint, maybe add more constraints 

  fetch(getAllUrl)
    .then((response) => response.json())
    .then((initialData) => {
      console.log(initialData);

      for (const event of initialData._embedded.events) {
        if (event._embedded.hasOwnProperty("attractions")) {
          initialDataArrayResults.push(event._embedded.attractions[0].name);
        }
      }

      uniqueArrayResults = [...new Set(initialDataArrayResults)];
      console.log(uniqueArrayResults);
      findCommonElement(uniqueArrayResults, uniqueSpotifyArtists);

      //remove duplicates from cross-check array
      crossCheckedArray = [...new Set(crossCheckedArray)];

      applyToDom(crossCheckedArray);
    })
    .catch((err) => {
      console.log(err);
    });

  console.log(uniqueSpotifyArtists);
  console.log(crossCheckedArray);
}



// discoveryApi fetch for tickets
specificArtist = "";
function getTickets() {
  console.log(crossCheckedArray);
  console.log(specificArtist);
  var url =
    "https://app.ticketmaster.com/discovery/v2/events.json?classificationName=music&keyword=" +
    specificArtist +
    "&apikey=eseLXtPfRbVGKGyJSqbCSi9iaudaWTws&latlong=" +
    latlon +
    "&radius=50&size=200";

  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      var e = document.getElementById("events");
      e.innerHTML = json.page.totalElements + " events found.";

      showEvents(json);
      getLocation();
      console.log(mapLat);
      console.log(mapLon);
      initMap(mapLat, mapLon, json);
    })
    .catch((err) => {
      console.log(err);
    });
}


// display the events and their details
function showEvents(json) {
  //.page ->> totalElements
  for (var i = 0; i < json.page.totalElements; i++) {
    const eventsEl = document.querySelector("#events");
    const eventContainer = document.createElement("div");
    const eventsNameEL = document.createElement("p");

    for (const newEvent of json._embedded.events) {
      if (newEvent._embedded.hasOwnProperty("attractions")) {
        eventsNameEL.textContent = newEvent._embedded.attractions[0].name;
      } else { console.log(newEvent) };
    }

    const eventsUrlEL = document.createElement("a");
    eventsUrlEL.setAttribute("href", `${json._embedded.events[i].url}`);
    eventsUrlEL.setAttribute("class", "hollow button expanded");
    eventsUrlEL.textContent = "Buy Tickets";
    eventContainer.appendChild(eventsNameEL);
    eventContainer.appendChild(eventsUrlEL);
    eventsEl.appendChild(eventContainer);
  }
}


// initialize map
function initMap(positionLat, positionLon, json) {
  var mapDiv = document.getElementById('map');
  var map = new google.maps.Map(mapDiv, {
    center: { lat: parseInt(positionLat), lng: parseInt(positionLon) },
    zoom: 10
  });
  console.log(json);
  for (var i = 0; i < json.page.totalElements; i++) {
    addMarker(map, json._embedded.events[i]);
  }
}


function addMarker(map, event) {
  console.log(event);
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(event._embedded.venues[0].location.latitude, event._embedded.venues[0].location.longitude),
    map: map
  });
  marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
  console.log(marker);
}


