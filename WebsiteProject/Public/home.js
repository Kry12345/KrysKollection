let personalServer = "https://kryskollection1.onrender.com/api";

const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
    if (token) {
        // user is logged in
        const loginBtnLink = document.getElementById("loginBtnLink");
        loginBtnLink.textContent = "Update Collection";
        loginBtnLink.href = "admin_updateCollection.html";
    }
});