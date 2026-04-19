// Show login choice modal when Login button is clicked
document.getElementById("loginBtn").addEventListener("click", function() {
  document.getElementById("loginChoiceModal").style.display = "flex";
});

// Open specific form
function openForm(type) {
  closeModal("loginChoiceModal");
  if (type === "seeker") {
    document.getElementById("seekerForm").style.display = "flex";
  } else {
    document.getElementById("providerForm").style.display = "flex";
  }
}

// Close modal
function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

// Close when clicking outside
window.onclick = function(event) {
  let modals = document.querySelectorAll(".modal");
  modals.forEach(modal => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
};
