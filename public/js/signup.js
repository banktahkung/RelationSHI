function Signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Check if the password is the same
  if (password !== confirmPassword) {
    alert("Passwords do not match");
  }

  // Check if the email is academic
  if (email.includes("26@student.chula.ac.th") === false) {
    alert("Please use the academic email");
  }

  // Fetch the data to the server
  try {
    fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    }).then((response) => {
      if (response.status === 200) {
        window.location.href = "/otp";
      } else if(response.status === 400){
        alert("The email and/or password is invalid");
      } else if(response.status === 401){
        alert("Sorry for the inconvenience, but you didn't register your data  via google form with us. [Data not found]");
      }
    });
  } catch (err) {
    console.error(err);
  }
}

function GotoLogin(){
  window.location.href = "/login";
}

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

