function Signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  console.log(email);

  if (password !== confirmPassword) {
    alert("Passwords do not match");
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
        window.location.href = "/";
      } else {
        alert("The email and/or password is invalid");
      }
    });
  } catch (err) {
    console.error(err);
  }
}
