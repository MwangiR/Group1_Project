const clientId = "07574a44bbef47ad9c5b4949cf020c29";
const redirectUri = "https://alexanderduncan1.github.io/Group1_Project/";

function authenticate() {
  const state = generateRandomString(16);
  localStorage.setItem("spotify_auth_state", state);

  const authorizeUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&state=${state}`;

  // Redirect to Spotify's authorization endpoint
  window.location.href = authorizeUrl;
}

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
    //console.error("Invalid state parameter.");
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
    client_secret: "3a121714103f4ebbbe8a1d88a0e5fa8c",
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
      const expiresIn = data.expires_in;

      // Use the access token for further actions
      console.log(accessToken);
      // Replace this comment with your desired code
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

// Call the handleCallback function when the page is loaded
window.addEventListener("DOMContentLoaded", handleCallback);

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

//--------------------------------------------------------------------
