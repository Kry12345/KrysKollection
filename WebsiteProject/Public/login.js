let personalServer = "https://kryskollection1.onrender.com/api";

document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();

    const username = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const response = await fetch(personalServer + '/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: username, password: password })
    });

    console.log(response);
    const data = await response.json();

    if (data.success) {
        console.log('Login successful!');
        localStorage.setItem("token", data.token);
        window.location.href = "home.html";
    } else {
        console.log('Login failed: ' + data.message);
    }


});