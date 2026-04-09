function showAlert(action) {
  if (action === 'Login') {
    const modal = document.createElement("div");
    modal.className = "modal";

    modal.innerHTML = `
      <div class="modal-box">
        <span class="btn-close" onclick="document.body.removeChild(document.querySelector('.modal'))">&times;</span>
        <h2>Select Login Type</h2>
        <div class="modal-buttons">
          <button class="btn-teal" onclick="openSeekerLogin()">Service Seeker</button>
          <button class="btn-orange" onclick="openProviderLogin()">Service Provider</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
}

function openSeekerLogin() {
  document.querySelector('.modal-box').innerHTML = `
    <span class="btn-close" onclick="document.body.removeChild(document.querySelector('.modal'))">&times;</span>
    <h2>Service Seeker Login</h2>
    <form class="login-form">
      <label>Email</label>
      <input type="email" placeholder="Enter your email" required>
      
      <label>Password</label>
      <input type="password" placeholder="Enter your password" required>
      
      <button type="submit" class="btn-teal">Login</button>
      <p class="signup-link">Don’t have an account? <a href="signup.html">Sign Up</a></p>
    </form>
  `;
}

function openProviderLogin() {
  document.querySelector('.modal-box').innerHTML = `
    <span class="btn-close" onclick="document.body.removeChild(document.querySelector('.modal'))">&times;</span>
    <h2>Service Provider Login</h2>
    <form class="login-form">
      <label>Email</label>
      <input type="email" placeholder="Enter your email" required>
      
      <label>Password</label>
      <input type="password" placeholder="Enter your password" required>
      
      <button type="submit" class="btn-orange">Login</button>
      <p class="signup-link">Don’t have an account? <a href="signup-provider.html">Sign Up</a></p>
    </form>

    
  `;
}
