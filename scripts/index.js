const clientId = "456f6a4204b744b0ad0bbc9b05bec3b3";
const redirectUri = "https://mwangir.github.io/Group1_Project/";
const clientSecret = "518ad5850c434ad3aca350a5e92fbf46";

let useTheseArtists = undefined;
//change
showNotify1("this ia a test", "success", "body");

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

      for (const playlist of playlists) {
        const playlistName = playlist.name;
        console.log("This are playlist nammes", playlistName);

        // const playlistNameEL = document.createElement("h2");
        // playlistNameEL.textContent = playlistName;
        // document.querySelector(".playlistName").append(playlistNameEL);

        // Extract artists from each playlist
        const playlistId = playlist.id;
        const playlistArtist = [];

        fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            // Extract artists from each track in the playlist
            // console.log("this is items", items);
            // const artists = items.flatMap((track) =>
            //   track.track.artists.map((artist) => artist.name),
            // );
            // console.log("Artists in Playlist:", artists);
            // console.log("-------------------------------");
            // if (!Array.isArray(artists)) throw new Error("Expected an Array");
            // playlistArtist.push(...artists);
            console.log("This is data", data);
            const items = data.items;
            const artistNames = [];
            console.log("This is items", items);
            for (const item of items) {
              const artists = item.track.artists;
              for (const artist of artists) {
                const artistName = artist.name;
                artistNames.push(artistName);

                //const artistNames = items.flatMap(item => item.track.artists.map(artist => artist.name));
              }
              console.log("This is artistNames----------------", artistNames);
              console.log("Artist Names:", artistNames.join(", ")); //output into a single line of code
            }
          });
      }

      // Iterate over each playlist
      const fetchPromises = playlists.map((playlist) => {
        const playlistId = playlist.id;
        return getPlaylistTracks(accessToken, playlistId)
          .then((tracks) => {
            // Extract artists from each track in the playlist
            const artists = tracks.flatMap((track) =>
              track.track.artists.map((artist) => artist.name),
            );
            console.log("Artists in Playlist:", artists);

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
          applyToDom(uniqueArtists);
          useTheseArtists = uniqueArtists;

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
      console.log("Library Artists:", libraryArtists);
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
const playlistEL = document.querySelector(".playlistTab");
function applyToDom(playlistObj) {
  const ulContainerEl = document.createElement("ul");

  playlistObj.forEach((artist) => {
    // const artistLiEL = document.createElement("li");
    // artistLiEL.textContent = artist;
    // ulContainerEl.appendChild(artistLiEL);
    accordionContent("Playlist", artist);
  });

  playlistEL.appendChild(ulContainerEl);
}

function accordionContent(title, items) {
  const accordionContainerEL = document.createElement("div");
  accordionContainerEL.setAttribute("class", "row");
  playlistEL.appendChild(accordionContainerEL);

  const accordionColumnEL = document.createElement("div");
  accordionColumnEL.setAttribute("class", "column");
  accordionContainerEL.appendChild(accordionColumnEL);

  const accordionUlEl = document.createElement("ul");
  accordionUlEl.setAttribute("class", "accordion");
  accordionUlEl.setAttribute("data-accordion", "");
  accordionUlEl.setAttribute("data-multi-expand", "true");
  accordionUlEl.setAttribute("data-allow-all-closed", "true");
  accordionColumnEL.appendChild(accordionUlEl);

  const accordionItemEL = document.createElement("li");
  accordionItemEL.setAttribute("class", "accordion-item");
  accordionItemEL.setAttribute("data-accordion-item", "");
  accordionUlEl.appendChild(accordionItemEL);

  const accordionTitleEl = document.createElement("a");
  accordionTitleEl.setAttribute("class", "accordion-title");
  accordionTitleEl.setAttribute("aria-expanded", "true");
  accordionTitleEl.textContent = title;
  accordionItemEL.appendChild(accordionTitleEl);

  const accordionContentEl = document.createElement("div");
  accordionContentEl.setAttribute("class", "accordion-content");
  accordionContentEl.setAttribute("data-tab-content", "");
  accordionItemEL.appendChild(accordionContentEl);

  //show
  for (const item of items) {
    const accordionTextEl = document.createElement("p");
    accordionTextEl.textContent = item;
    accordionContentEl.appendChild(accordionTextEl);
  }

  accordionItemEL.addEventListener("click", function () {
    this.classList.toggle("is-active");
    if (this.classList.contains("is-active")) {
      accordionContentEl.style.display = "block";
      accordionContentEl.style.transition = "display 1s ";
      accordionTitleEl.setAttribute("aria-expanded", "true");
      accordionContentEl.setAttribute("aria-hidden", "false");
    } else {
      accordionContentEl.style.display = "none";
      accordionTitleEl.setAttribute("aria-expanded", "false");
      accordionContentEl.setAttribute("aria-hidden", "true");
    }
  });
}

function showNotify1(text, color, element) {
  const notifyContainer = document.createElement("div");
  notifyContainer.className = `${color} callout`;
  notifyContainer.innerHTML = `<h5>${text}</h5>`;
  notifyContainer.setAttribute(
    "style",
    "width:300px; position:absolute; right:0; top:10%; left:5%;",
  );
  $(`${element}`).append(notifyContainer);

  setTimeout(function () {
    notifyContainer.remove();
  }, 3000);
}

document.querySelector(".testModal").addEventListener("click", () => {
  //showModal();
  //showNotify1("This is a test", "info", ".testModal");
  accordionContent("Test", "This is a test accordion");
});
function showModal() {
  const modalContainer = document.createElement("div");
  modalContainer.classList.add("reveal");
  modalContainer.setAttribute("id", "Modal");
  modalContainer.setAttribute("data-reveal", "");
  modalContainer.setAttribute(
    "style",
    "display:grid; place-items:center; position:absolute; top:30%; left:30%;",
  );

  const modalSpan = document.createElement("span");
  modalSpan.setAttribute("aria-hidden", "true");
  modalSpan.innerHTML = "&times;";

  const modalButton = document.createElement("button");
  modalButton.className = "close-button";
  modalButton.setAttribute("data-close", "");
  modalButton.setAttribute("aria-label", "Close modal");
  modalButton.setAttribute("type", "button");
  modalButton.appendChild(modalSpan);
  modalContainer.append(modalButton);

  const modalTitle = document.createElement("h5");
  modalTitle.textContent = "This is a modal";
  modalContainer.append(modalTitle);

  modalSpan.addEventListener("click", function () {
    modalContainer.remove();
  });

  document.querySelector("body").append(modalContainer);
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
    modalDiv();
    //showNotify("this is a warning", "success", "body");
    console.log("clicked");
  });
  $(document).foundation();
});

// ----------------------------------------------------------------------------
// Discovery API Section

// //google maps api
// const mapsKey = "AIzaSyBYf20aoNlqP4t3mGaRW__BmWmIoVyuDEg";
// const mapsRequestUrl = "https://www.google.com/maps/embed/v1/search?key=" + mapsKey + "&center=" + `${userLatitde}` + "," + `${userLongitude}` + "&zoom=15";

// bring in spotify playlists

// get geolocation
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    var x = document.getElementById("location");
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  var latlon = position.coords.latitude + "," + position.coords.longitude;

  let alexArray = useTheseArtists;
  console.log(alexArray);
  let artistsArray = alexArray.join(" ");
  console.log(artistsArray);

  // discoveryApi fetch
  var url =
    "https://app.ticketmaster.com/discovery/v2/events.json?classificationName=music&keyword=" +
    artistsArray +
    "&sort=relevance,desc&apikey=eseLXtPfRbVGKGyJSqbCSi9iaudaWTws&latlong=" +
    latlon +
    "&radius=50";

  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      var e = document.getElementById("events");
      e.innerHTML = json.page.totalElements + " events found.";
      showEvents(json);
      initMap(position, json);
    })
    .catch((err) => {
      console.log(err);
    });
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

// display the events and their details
function showEvents(json) {
  for (var i = 0; i < json.page.size; i++) {
    const eventsEl = document.querySelector("#events");
    const eventContainer = document.createElement("div");

    const eventsNameEL = document.createElement("p");
    eventsNameEL.textContent = json._embedded.events[i].name;

    const eventsUrlEL = document.createElement("a");
    eventsUrlEL.setAttribute("href", `${json._embedded.events[i].url}`);
    eventsUrlEL.setAttribute("class", "hollow button expanded");
    eventsUrlEL.textContent = "Buy Tickets";

    eventContainer.appendChild(eventsNameEL);
    eventContainer.appendChild(eventsUrlEL);
    eventsEl.appendChild(eventContainer);

    // $("#events").append(
    //   "<p>" + json._embedded.events[i].name,
    //   "<a href = " + `${json._embedded.events[i].url}` + ">Buy Tickets" + "</p>",
    // );
  } // image  "<img src =" + json._embedded.events[i].images[0].url + ">",
}

// initialize map
function initMap(position, json) {
  var mapDiv = document.getElementById("map");
  var map = new google.maps.Map(mapDiv, {
    center: { lat: position.coords.latitude, lng: position.coords.longitude },
    zoom: 11,
  });
  for (var i = 0; i < json.page.size; i++) {
    addMarker(map, json._embedded.events[i]);
  }
}

// add markers to map
function addMarker(map, event) {
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

// generate map and event results
const generateContent = document.querySelector("#updateContent");
generateContent.addEventListener("click", function (event) {
  console.log(event);
  event.preventDefault();
  getLocation();
});

//---------------------------------------------------------
//initalize foundation css
Foundation.addToJquery($);
$(document).foundation();

//--------------------------------------------------------------
