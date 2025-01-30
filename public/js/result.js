async function GettestPerson() {
  const location = "/resultPerson";

  try {
    const response = await fetch(location, {
      method: "GET",
    });

    // Await the JSON parsing
    const data = await response.json();
    return data.testPerson; // Return the data
  } catch (error) {
    console.error("Error fetching test person:", error);
  }
}

window.onload = async function () {
    const testPerson = await GettestPerson();

    const IG = document.getElementById("IG");

    IG.textContent = "IG : " + testPerson.Contact.IG;

    const Header = document.getElementById("Header");

    Header.style.transition = "top 1s ease-in-out";
    Header.style.top = "0vh";
}

function getTheInformation(){
  
}