const params = new URLSearchParams(window.location.search);
const cardId = params.get("id");

function init () {
    const cardContainer = document.getElementById("card-details");
    cardContainer.innerHTML = "<h1>Loading card...</h1>";
}

init();