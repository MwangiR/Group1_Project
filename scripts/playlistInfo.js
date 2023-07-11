function fetchArtistInfoFromLastFM(artistName) {
  const apiKey = "de1822b6fc0eff2b6de0fd51d1501598";
  const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(
    artistName,
  )}&api_key=${apiKey}&format=json`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      const artistName = data.artist.name;
      const artistBio = data.artist.bio.summary;
      const cleanedArtistBio = artistBio.replace(/<a.*?>(.*?)<\/a>/g, "$1");
      //   console.log(cleanedArtistBio);
      //   document.querySelector(".artistName").textContent = artistName;
      //   document.querySelector(".artistBio").textContent = cleanedArtistBio;
      getTopTracks(artistName);
      modalInfo(artistName, cleanedArtistBio);
      getSimilarArtist(artistName);
    })
    .catch((err) => console.log(err));
}

const displayInfoEL = document.querySelector("#displayInfo");
displayInfoEL.innerHTML = "";

document.querySelector(".showModal").appendChild(displayInfoEL);

function getTopTracks(artist) {
  const params = new URLSearchParams({
    method: "artist.getTopTracks",
    api_key: "de1822b6fc0eff2b6de0fd51d1501598",
    artist: artist,
    format: "json",
  });

  const apiUrl = `https://ws.audioscrobbler.com/2.0/?${params}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      //console.log(data);

      const topTracks = data.toptracks.track;
      //console.log(topTracks);

      displayInfoEL.appendChild(topTracksList);

      const topTracksList = document.createElement("ul");

      const topTracksTitle = document.createElement("h2");
      topTracksTitle.textContent = "Top Tracks";
      topTracksList.appendChild(topTracksTitle);

      topTracks.slice(0, 10).forEach((track) => {
        // console.log(track.name);
        // console.log(parseInt(track.playcount));
        // console.log(track.url);

        // Create a list item for each track
        const trackItem = document.createElement("li");

        // Create an anchor element for the track name and set the href to the track URL
        const trackNameLink = document.createElement("a");
        trackNameLink.textContent = track.name;
        trackNameLink.href = track.url;

        // Create a span element for the playcount
        const playcountSpan = document.createElement("span");
        playcountSpan.textContent = ` Playcount: ${parseInt(track.playcount).toLocaleString()}`;

        // Append the track name and playcount to the list item
        trackItem.appendChild(trackNameLink);
        trackItem.appendChild(playcountSpan);

        // Append the list item to the top tracks list
        topTracksList.appendChild(trackItem);
      });

      // Append the top tracks list to the modal
      document.querySelector("#displayInfo").appendChild(topTracksList);
    });
}

function getSimilarArtist(artist) {
  const params = new URLSearchParams({
    method: "artist.getSimilar",
    api_key: "de1822b6fc0eff2b6de0fd51d1501598",
    artist: artist,
    format: "json",
  });

  const apiUrl = `https://ws.audioscrobbler.com/2.0/?${params}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log(data.similarartists.artist);

      const similarArtists = data.similarartists.artist;

      displayInfoEL.appendChild(topSimilarArtist);

      const topSimilarArtist = document.createElement("ul");
      const topSimilarTitle = document.createElement("h2");
      topSimilarTitle.textContent = "Similar Artists";
      topSimilarArtist.appendChild(topSimilarTitle);

      similarArtists.slice(0, 10).forEach((similarArtist) => {
        console.log(similarArtist.name);
        console.log(similarArtist.url);

        const similarArtistItem = document.createElement("li");

        const similarArtistNameLink = document.createElement("a");
        similarArtistNameLink.textContent = similarArtist.name;
        similarArtistNameLink.href = similarArtist.url;

        similarArtistItem.appendChild(similarArtistNameLink);

        topSimilarArtist.appendChild(similarArtistItem);
      });
      // append to DOM element with id="similar-artists" in index.html file
      document.querySelector("#displayInfo").appendChild(topSimilarArtist);
    });
}

function removeElement() {
  document.querySelector("#displayInfo").remove();
}
function modalInfo(artist, bio) {
  const titleEL = document.createElement("h1");
  titleEL.textContent = artist;

  const artBio = document.createElement("p");
  artBio.textContent = bio;

  displayInfoEL.appendChild(titleEL);
  displayInfoEL.appendChild(artBio);
}

// Usage example
//const artistName = "linkin park";
//fetchArtistInfoFromLastFM(artistName);

//initalize foundation css
Foundation.addToJquery($);
$(document).foundation();
