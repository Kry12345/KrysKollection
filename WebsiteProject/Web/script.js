const tcgdex = new TCGdex("en");

const binder1Button = document.getElementById("binder1");
const collectionButton = document.getElementById("collection");
const updateCollectionButton = document.getElementById("updateCollection");


if (binder1Button) {
  document.getElementById("binder1").addEventListener("click", function() {
    window.location.href = "binder1.html";
  });
}

if (collectionButton) {
  document.getElementById("collection").addEventListener("click", function() {
    window.location.href = "collection.html";
  });
}

if (updateCollectionButton) {
  document.getElementById("updateCollection").addEventListener("click", function() {
    window.location.href = "updateCollectionList.html";
  });
}




/*(async () => {
  const cards = await tcgdex.card.list();
  console.log(cards);
})();*/

/*async function showCard() {
    const card = await tcgdex.fetch("cards", "swsh3-136");
    const highQualityPng = getHighQualityPictureUrl(card);

    const html = `
        <h2>${card.name}</h2>
        <img src="${highQualityPng}" alt="${card.name}" width="250">
        <p>Set: ${card.set.name}</p>
        <p>HP: ${card.hp}</p>
        <p>Types: ${card.types.join(", ")}</p>
        `;

    document.getElementById("card").innerHTML = html;
}

showCard();



*/

function getHighQualityPictureUrl(card) {
    return card.image + "/high.png";
}

async function getCard() {

    const response = await fetch('https://api.tcgdex.net/v2/en/cards?name=Charizard&id=sv03.5');
    const data = await response.json();
    console.log(data);
    //const card = await tcgdex.fetch("cards", "swsh3-136");
    //console.log(card.id);

    let html = ``;

    for (let cardData of data)
    {
        const card = await tcgdex.fetch("cards", cardData.id);
        const highQualityPng = getHighQualityPictureUrl(card);

        html += `<h2>${card.name}</h2>
        <img src="${highQualityPng}" alt="${card.name}" width="250">
        <p>Set: ${card.set.name}</p>
        <p>HP: ${card.hp}</p>
        <p>Types: ${card.types.join(", ")}</p>
        <p>id: ${card.id}</p>`;
    }

    document.getElementById("card").innerHTML = html;
}

async function formatCardHtml(cardId) {
    const card = await tcgdex.fetch("cards", cardId);
    const highQualityPng = getHighQualityPictureUrl(card);
    return `<h2>${card.name}</h2>
        <img src="${highQualityPng}" alt="${card.name}" width="250">
        <p>Set: ${card.set.name}</p>
        <p>HP: ${card.hp}</p>
        <p>Types: ${card.types.join(", ")}</p>
        <p>id: ${card.id}</p>`;
}
