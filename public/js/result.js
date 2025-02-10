async function GetPartner() {
  const location = "/resultPerson";

  try {
    const response = await fetch(location, {
      method: "GET",
    });

    // Await the JSON parsing
    const data = await response.json();
    return data.person; // Return the data
  } catch (error) {
    console.error("Error fetching test person:", error);
  }
}

async function GetPerson(){
  const location = "/resultData";

  try {
    const response = await fetch(location, {
      method: "GET",
    });

    // Await the JSON parsing
    const data = await response.json();
    return data.person; // Return the data
  } catch (error) {
    console.error("Error fetching test person:", error);
  }
}

window.onload = async function () {
  const Person = await GetPerson();
  const Partner = await GetPartner();

  const IG = document.getElementById("IG");
  const userImage = document.getElementById("userImage");
  const partnerImage = document.getElementById("partnerImage");
  const MatchingMessage = document.querySelector(".MessageContent");

  IG.textContent = "IG : " + Partner.IG;

  // Fix the ternary logic for image paths
  userImage.src = Person.ImagePath ? Person.ImagePath : "/images/logo.png";
  partnerImage.src = Partner.ImagePath ?  Partner.ImagePath : "/images/logo.png";

  // Matching message
  MatchingMessage.textContent = Partner.MatchingMessage;

  const Header = document.getElementById("Header");

  Header.style.transition = "top 1s ease-in-out";
  Header.style.top = "0vh";
};

// DomContentLoaded event
document.addEventListener("DOMContentLoaded", async function () {
  const warningContent = document.getElementById("WarningContent");
  const popularity = await GetPopularity();
  const PopularityContent = document.getElementById("popularity");

  PopularityContent.textContent = " 🤝 ในขณะนี้มีคนอยากรู้จักคุณ : " + (popularity? popularity : 0);

  // Function to check the orientation
  function checkOrientation() {
    if (window.innerWidth > window.innerHeight) {
      // Landscape mode
      warningContent.style.display = "flex";
    } else {
      // Portrait mode
      warningContent.style.display = "none";
    }
  }

  // Initial check
  checkOrientation();

  // Check on resize
  window.addEventListener("resize", checkOrientation);
});

// Get the popularity
async function GetPopularity() {
  const location = "/popularity";

  try {
    const response = await fetch(location, {
      method: "GET",
    });

    // Await the JSON parsing
    const data = await response.json();

    return data.pop; // Return the data
  } catch (error) {
    console.error("Error fetching popularity:", error);
  }
}

setInterval(async function () {
  const popularity = await GetPopularity();
  const PopularityContent = document.getElementById("popularity");

  PopularityContent.textContent = " 🤝 ในขณะนี้มีคนอยากรู้จักคุณ : " + (popularity? popularity : 0);
}, 60000)