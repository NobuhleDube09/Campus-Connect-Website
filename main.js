async function validateSignupUser(event) {
  event.preventDefault();

  const fullName = document.getElementById("seeker-name").value;
  const email = document.getElementById("seeker-email").value;
  const studentNumber = document.getElementById("seeker-student-number").value;
  const password = document.getElementById("seeker-password").value;
  const servicesNeeded = document.getElementById("seeker-needs").value;

  const response = await fetch("http://localhost:3000/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, studentNumber, password, servicesNeeded })
  });

  const result = await response.json();

  if (result.success) {
    alert("Sign-up successful!");
    // Redirect to dashboard with email in query string
    window.location.href = `dashboard.html?email=${encodeURIComponent(email)}`;
  } else {
    alert("Error: " + result.message);
  }
}
// Open modal when Sign Up button is clicked
document.querySelector(".btn-signup").addEventListener("click", function() {
  document.getElementById("signupModal").style.display = "block";
});

// Close modal
function closeModal() {
  document.getElementById("signupModal").style.display = "none";
}

// Handle form submission
document.getElementById("popupSignupForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value;
  const surname = document.getElementById("surname").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const servicesNeeded = document.getElementById("servicesNeeded").value;

  try {
    const response = await fetch("http://localhost:3000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, surname, email, password, servicesNeeded })
    });

    const data = await response.json();
    document.getElementById("responseMessage").innerText = data.message;

    if (data.success) {
      closeModal();
      alert("Sign-up successful!");
      window.location.href = `dashboard.html?email=${encodeURIComponent(email)}`;
    }
  } catch (error) {
    document.getElementById("responseMessage").innerText = "Error signing up.";
    console.error(error);
  }
});
