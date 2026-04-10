function filterServices() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const services = document.getElementById("servicesGrid").getElementsByClassName("service");
  let found = false;

  for (let i = 0; i < services.length; i++) {
    const title = services[i].getElementsByTagName("h3")[0].innerText.toLowerCase();
    if (title.includes(input)) {
      services[i].style.display = "";
      found = true;
    } else {
      services[i].style.display = "none";
    }
  }

  
  let message = document.getElementById("notFoundMessage");
  if (!message) {
    message = document.createElement("p");
    message.id = "notFoundMessage";
    message.style.textAlign = "center";
    message.style.color = "#F97316"; 
    message.style.fontWeight = "600";
    message.style.marginTop = "20px";
    document.querySelector(".services").appendChild(message);
  }

  if (!found && input.trim() !== "") {
    message.textContent = `No services found for "${input}".`;
  } else {
    message.textContent = "";
  }
}


document.getElementById("searchInput").addEventListener("keyup", filterServices);

