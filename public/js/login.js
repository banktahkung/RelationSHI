// DomContentLoaded event
document.addEventListener("DOMContentLoaded", function () {
  const warningContent = document.getElementById("WarningContent");

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

// Function to login
function Login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Fetch the data to the server
  try {
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    }).then((response) => {
      if (response.status === 200) {

        const body = document.getElementById("body");

        body.style.transition = "top 1.5s ease-in-out";
        body.style.top = "-100vh";

        setTimeout(() => {
          window.location.href = "/home";
        }, 2000);
      } else {
        alert("The email and/or password is invalid");
      }
    });
  } catch (err) {
    console.error(err);
  }
}
