//https://kryskollection1.onrender.com/api
//http://localhost:3000/api
let personalServer = "https://kryskollection1.onrender.com/api";

const token = localStorage.getItem("token");

const tcgdex = new TCGdex("en");

let currentSearchQuery = "";
let currentSetFilter = [];

let displayCards = [];

const searchInput = document.getElementById("collection-search");
const submitSearchInput = document.getElementById("submit-search");
const container = document.getElementById("card-container");


document.addEventListener("DOMContentLoaded", async () => {
    $('#set-filter').select2({
        placeholder: "Select Types"
    });

    await createFilters();

    const savedFilter = localStorage.getItem("collectionSetFilter");

    if (savedFilter) {
        currentSetFilter = JSON.parse(savedFilter);
        $('#set-filter').val(currentSetFilter).trigger('change');
    }

    const validToken = await verifyToken();

    console.log("Token valid:", validToken);

    if (!validToken) {
        localStorage.setItem("token", "");
        // Invalid token, redirect to login
        window.location.href = "login.html";
        return;
    }
    if (token) {
        // user is logged in
        const loginBtnLink = document.getElementById("loginBtnLink");
        loginBtnLink.textContent = "Update Collection";
        loginBtnLink.href = "admin_updateCollection.html";

        // Restore search query
        const savedQuery = localStorage.getItem("collectionSearchQuery");
        if (savedQuery) {
            currentSearchQuery = savedQuery;
            searchInput.value = currentSearchQuery;
        }
        const savedFilter = localStorage.getItem("collectionSetFilter");
        if (savedFilter) {
            currentSetFilter = JSON.parse(savedFilter);
        }

        // Restore set filter

        // If any filters exist, update the cards automatically
        if (currentSearchQuery || currentSetFilter.length > 0) {
            updateDisplayCards(currentSearchQuery, currentSetFilter);
        }
    }
});

searchInput.addEventListener("input", () => {
    currentSearchQuery = searchInput.value;
});

$('#set-filter').on('change', function () {
    const selectedValues = $(this).val(); // array or null
    currentSetFilter = selectedValues || [];

});

submitSearchInput.addEventListener("click", () => {
    if (currentSearchQuery || currentSetFilter.length > 0) {
        updateDisplayCards(currentSearchQuery, currentSetFilter);
    }
    localStorage.setItem("collectionSetFilter", JSON.stringify(currentSetFilter));
    localStorage.setItem("collectionSearchQuery", currentSearchQuery);
});


container.addEventListener("click", async (e) => {
// Check for minus or plus buttons
    e.preventDefault();
    e.stopPropagation(); 
    if (e.target.matches(".minus-btn") || e.target.matches(".plus-btn")) {
        const isPlus = e.target.matches(".plus-btn");
        const cardId = e.target.dataset.id;
        const type = e.target.dataset.type; // "normal" or "reverse"

        const cardInfo = await tcgdex.fetch("cards", cardId);
        const reverseExists = cardInfo.variants.reverse ? true : false;
        const setId = cardInfo.set.id;

        // Find the right display element
        const spanId = type === "normal" ? `qty-${cardId}` : `rev-${cardId}`;
        const span = document.getElementById(spanId);

        let current = parseInt(span.textContent) || 0;
        current = isPlus ? current + 1 : Math.max(0, current - 1);

        // Update the UI immediately
        span.textContent = current;

        try {
        // Save back to server
            const temp = await fetch(`/api/card/quantity/${cardId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`},
                body: JSON.stringify({
                    type: type,        // "normal" or "reverse"
                    newQuantity: current,
                    reverseExists: reverseExists,
                    setId: setId
                })
            });
            const result = await temp.json();
            console.log(result);
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    }
});



async function updateDisplayCards(search, filter) {
    const cards = await fetch(`https://api.tcgdex.net/v2/en/cards?name=${search}&set=${filter.join(",")}`);
    const data = await cards.json();
    displayCards = data;
    showCollectionCards();
}

async function createFilters() {
    const allSets = await tcgdex.fetch("sets");
    setFilter = document.getElementById("set-filter");
    allSets.forEach(set => {
        const option = document.createElement("option");
        option.value = set.id;
        option.text = set.name;
        setFilter.appendChild(option);
    });
}

async function showCollectionCards() {
    console.log("Getting collection cards...");
    const container = document.getElementById("card-container");
    container.innerHTML = "";
    for (let cardData of displayCards)
    {
        const cardElem = document.createElement("div");
        cardElem.classList.add("card"); // add your CSS class
        
        let html = '';
        html += await formatCardHtml(cardData);

        cardElem.innerHTML = html;
        container.appendChild(cardElem);
    }
}

async function formatCardHtml(card) {
    const highQualityPng = getHighQualityPictureUrl(card);
    let quantities = await fetch(personalServer + `/card/quantity/${card.id}`);
    const data = await quantities.json();
    let quantity = 0;
    let reverseQuantity = 0;
    if (data.found)
    {
        quantity = data.quantity;
        reverseQuantity = data.reverse_quantity;
    }
    else
    {
        let cardInfo = await tcgdex.fetch("cards", card.id);
        quantity = 0;
        reverseQuantity = cardInfo.variants.reverse ? 0 : null;
    }



    html = `<h2>${card.name}</h2>
        <img src="${highQualityPng}" alt="${card.name}" width="250">
        <p>id: ${card.id}</p>
        <div class="qty-group">
          <button type="submit" class="minus-btn" data-type="normal" data-id="${card.id}">−</button>
          <span class="qty-value" id="qty-${card.id}">${quantity}</span>
          <button type="submit" class="plus-btn" data-type="normal" data-id="${card.id}">+</button>
        </div>
        `;
    if (reverseQuantity !== null) {
        html += `<div class="qty-group">
          <button type="submit" class="minus-btn" data-type="reverse" data-id="${card.id}">−</button>
          <span class="qty-value" id="rev-${card.id}">${reverseQuantity}</span>
          <button type="submit" class="plus-btn" data-type="reverse" data-id="${card.id}">+</button>
        </div>`;
    }


    return html;
}

// Get high quality picture URL
function getHighQualityPictureUrl(card) {
    if (card.image) {
        return card.image + "/high.png";
    }
    return "";
}



async function verifyToken()
{
    const response = await fetch('/api/verifyToken', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    return data.success;
}

