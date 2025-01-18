function Signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Check if the password is the same
  if (password !== confirmPassword) {
    alert("Passwords do not match");
  }

  // Check if the email is academic
  /*if (email.includes("26@student.chula.ac.th") === false) {
    alert("Please use the academic email");
  }*/

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
      } else {
        alert("The email and/or password is invalid");
      }
    });
  } catch (err) {
    console.error(err);
  }
}

function GotoLogin(){
  window.location.href = "/login";
}
