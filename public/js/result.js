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

  console.log(Person.ImagePath);
  console.log(Partner);

  const IG = document.getElementById("IG");
  const userImage = document.getElementById("userImage");
  const partnerImage = document.getElementById("partnerImage");
  const MatchingMessage = document.getElementById("MatchingMessage");

  IG.textContent = "IG : " + Partner.IG;

  // Fix the ternary logic for image paths
  userImage.src = Person.ImagePath ? "/images/" + Person.ImagePath : "/images/logo.png";
  partnerImage.src = Partner.ImagePath ? "/images/" + Partner.ImagePath : "/images/logo.png";

  // Matching message
  MatchingMessage.textContent = Partner.MatchingMessage;

  const Header = document.getElementById("Header");

  Header.style.transition = "top 1s ease-in-out";
  Header.style.top = "0vh";
};


function getTheInformation(){
  
}