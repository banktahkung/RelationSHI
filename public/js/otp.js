function resendOTP() {
  fetch("/resendOTP", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: document.getElementById("email").value,
    }),
  }).then((res) => {
    if (res.status === 200) {
      alert("OTP sent successfully");
    } else {
      alert("Failed to send OTP");
    }
  });
}

// Verify the OTP
function VerifyOTP() {
  const OTP = document.getElementById("otp").value;

  fetch("/OTP", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      OTP: OTP,
    }),
  }).then((res) => {
    if (res.status === 200) {
      Transition();

      setTimeout(()=>{
        window.location.href = "/home";
      }, 4000)
    } else {
      alert("Invalid OTP");
    }
  });
}

// Disable the resend button
function DisableResend() {
  document.getElementById("resend").disabled = true;
  setTimeout(() => {
    document.getElementById("resend").disabled = false;
  }, 30000);
}

function Transition() {
  // Access the body element correctly
  const body = document.getElementById("content");
  const loginbutton = document.querySelector(".LoginButton");

  loginbutton.style.transition = "opacity 0.5s ease-in-out";
  loginbutton.style.opacity = "0";

  body.style.transition = "all 2.5s ease-in-out";
  body.style.position = "absolute";
  body.style.top = "-100vh";
}

function GotoLogin() {
  window.location.href = "/login";
}
