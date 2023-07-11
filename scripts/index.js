const clientId = "07574a44bbef47ad9c5b4949cf020c29";
const redirectUri = "https://alexanderduncan1.github.io/Group1_Project/";
const clientSecret = "3a121714103f4ebbbe8a1d88a0e5fa8c";

// Function to handle user authentication and authorization
let tokenVariable = "";
authenticationCheck(tokenVariable);
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
      // Replace HTML space characters with regular spaces
      //console.log(typeof accessToken);
      authenticationCheck(accessToken);

      // Log the access token for debugging
      //console.log("Access Token:", accessToken);

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
          //console.log("All Playlist Artists:", uniqueArtists);
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
  //const container = document.querySelector(".artist-list-container");
  //container.appendChild(artistList);
}

// Call the handleCallback function when the page is loaded
window.addEventListener("DOMContentLoaded", handleCallback);

//-------------------------------------------------------------------
//apply to dom function

var redBadge;
var greenBadge;
function authenticationCheck(tokenVariable) {
  if (tokenVariable === null || tokenVariable === "") {
    redBadge = document.createElement("span");
    redBadge.setAttribute("class", "badge alert");
    const redIcon = document.createElement("i");
    redIcon.setAttribute("class", "fi-x");
    redBadge.appendChild(redIcon);
    document.querySelector("#badgeIcon").appendChild(redBadge);

    if (greenBadge) {
      greenBadge.remove();
      greenBadge = null;
    }
  } else {
    if (redBadge) {
      redBadge.remove();
      redBadge = null;
    }

    greenBadge = document.createElement("span");
    greenBadge.setAttribute("class", "badge success");
    const greenIcon = document.createElement("i");
    greenIcon.setAttribute("class", "fi-check");
    greenBadge.appendChild(greenIcon);
    document.querySelector("#badgeIcon").appendChild(greenBadge);
  }
}

//don't touch this function.Remain as is
function applyToDom(playlistObj) {
  const playlistEL = document.querySelector(".playlistTab"); //edit
  playlistEL.innerHTML = "";

  playlistObj.forEach((artist) => {
    const searchResultEl = document.createElement("div");
    searchResultEl.setAttribute("id", "searchResult");

    const artistTitleEl = document.createElement("div");
    artistTitleEl.setAttribute("id", "playlistTitle");
    searchResultEl.appendChild(artistTitleEl);

    const searchResultTitle = document.createElement("h3");
    searchResultTitle.textContent = artist;
    artistTitleEl.appendChild(searchResultTitle);

    const searchTicketEl = document.createElement("div");
    searchTicketEl.setAttribute("id", "searchTicket");
    searchResultEl.appendChild(searchTicketEl);

    const moreInfoBtn = document.createElement("button");
    moreInfoBtn.setAttribute("class", "button expanded"); // added expanded class
    moreInfoBtn.setAttribute("data-open", "infoModal");
    moreInfoBtn.textContent = "More Info";
    // make button stretch to fill available space like 'Search Ticket'

    moreInfoBtn.addEventListener("click", () => {
      fetchArtistInfoFromLastFM(artist);
    });

    searchTicketEl.appendChild(moreInfoBtn);

    // const artistLiEL = document.createElement("li");
    // artistLiEL.className = "artistGenerated";
    // artistLiEL.textContent = artist;
    //add search for ticket button here
    const ticketEL = document.createElement("button");
    ticketEL.setAttribute("class", "success button expanded");
    ticketEL.classList.add("this-button");
    ticketEL.textContent = "Search Ticket";
    ticketEL.addEventListener("click", function (event) {
      // generate tickets
      console.log(event);
      let thisArtist = event.target.parentNode.parentNode.firstChild.textContent;
      specificArtist = thisArtist;
      console.log(thisArtist);
      console.log(this.parentNode);
      event.preventDefault();
      //getLocation(); // logged this back in, might not be needed
      getTickets();
      //showNotify("List generated", "success", "#authSection");
    });

    searchTicketEl.appendChild(ticketEL);
    playlistEL.appendChild(searchResultEl);
  });
}

function showNotify(text, color, element) {
  const notifyContainer = document.createElement("div");
  notifyContainer.className = `${color} callout`;
  notifyContainer.innerHTML = `<h5>${text}</h5>`;
  $(`${element}`).prepend(notifyContainer);

  setTimeout(function () {
    notifyContainer.remove();
  }, 3000);
}

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
  event.preventDefault();
  showNotify("Generating List...", "success", "#authSection"); // moved this here so displays when 'generate list is clicked
  getLocation();
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
let mapLat = "";
let mapLon = "";
function showPosition(position) {
  latlon = position.coords.latitude + "," + position.coords.longitude;
  mapLat = position.coords.latitude;
  mapLon = position.coords.longitude;
  //console.log(position);
  initialArtists();
}

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
    "&radius=10&size=200";

  fetch(getAllUrl)
    .then((response) => response.json())
    .then((initialData) => {
      // console.log("this is initial data", initialData);

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

  //console.log(uniqueSpotifyArtists);
  //console.log(crossCheckedArray);
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
      // console.log(json);
      var e = document.getElementById("events");
      // e.innerHTML = json.page.totalElements + " events found.";
      const eventsFoundEl = document.createElement("div");

      if (json.page.totalElements === 0 || !json.page.totalElements) {
        eventsFoundEl.setAttribute("class", "alert callout");
        eventsFoundEl.textContent = json.page.totalElements + " event(s) found";
      } else {
        eventsFoundEl.setAttribute("class", "success callout");
        eventsFoundEl.textContent = json.page.totalElements + " event(s) found";
      }

      const previousElement = e.firstElementChild;
      //if there was a previuos child
      if (previousElement) {
        e.replaceChild(eventsFoundEl, previousElement);
        //previousElement.remove();
      }
      e.prepend(eventsFoundEl);

      showEvents(json);
      //getLocation(); //may need this-----testing for map fix=----------------
      //console.log(mapLat);
      //console.log(mapLon);
      initMap(mapLat, mapLon, json);
    })
    .catch((err) => {
      console.log(err);
    });
}

// display the events and their details
function showEvents(json) {
  for (var i = 0; i < json.page.totalElements; i++) {
    const eventsEl = document.querySelector("#events");
    const eventContainer = document.createElement("div");
    const eventsNameEL = document.createElement("p");

    for (const newEvent of json._embedded.events) {
      if (newEvent._embedded.hasOwnProperty("attractions")) {
        eventsNameEL.textContent = newEvent._embedded.attractions[0].name;
      } else {
        console.log(newEvent);
      }
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

function initMap(mapLat, mapLon, json) {
  const mapDiv = document.getElementById("map");
  const map = new google.maps.Map(mapDiv, {
    center: { lat: mapLat, lng: mapLon },
  });

  const bounds = new google.maps.LatLngBounds();

  for (let i = 0; i < json.page.totalElements; i++) {
    const event = json._embedded.events[i];
    const venueLat = event._embedded.venues[0].location.latitude;
    const venueLon = event._embedded.venues[0].location.longitude;
    const venueLatLng = new google.maps.LatLng(venueLat, venueLon);

    google.maps.event.addListener(map, "zoom_changed", function () {
      zoomChangeBoundsListener = google.maps.event.addListener(
        map,
        "bounds_changed",
        function (event) {
          if (this.getZoom() > 15 && this.initialZoom == true) {
            // Change max/min zoom here
            this.setZoom(12);
            this.initialZoom = false;
          }
          google.maps.event.removeListener(zoomChangeBoundsListener);
        },
      );
    });
    map.initialZoom = true;

    bounds.extend(venueLatLng);
    addMarker(map, event);
  }

  map.fitBounds(bounds);
}

function addMarker(map, event) {
  console.log(event);
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(
      event._embedded.venues[0].location.latitude,
      event._embedded.venues[0].location.longitude,
    ),
    map: map,
  });
  marker.setIcon("http://maps.google.com/mapfiles/ms/icons/red-dot.png");
  console.log(marker);
}

//---------------------------------------------------
//leave this bit always at the bottom
Foundation.addToJquery($);
$(document).foundation();
//---------------------------------------------------
