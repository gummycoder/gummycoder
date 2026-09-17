/* =========================================================
   GUMMYCODER GAME HUB
   main.js
========================================================= */


/* =========================================================
   STATE
========================================================= */

let favorites = [];

let currentGame = null;

let currentPage = "home";

let currentCategory = null;

let searchQuery = "";


/* =========================================================
   ELEMENTS
========================================================= */

const pages = {
    home: document.getElementById("homePage"),
    games: document.getElementById("gamesPage"),
    favorites: document.getElementById("favoritesPage"),
    category: document.getElementById("categoryPage"),
    player: document.getElementById("playerPage"),
    settings: document.getElementById("settingsPage")
};

const searchInput =
    document.getElementById("searchInput");

const featuredGames =
    document.getElementById("featuredGames");

const allGames =
    document.getElementById("allGames");

const favoriteGames =
    document.getElementById("favoriteGames");

const categoryGames =
    document.getElementById("categoryGames");

const emptyFavorites =
    document.getElementById("emptyFavorites");

const categoryLabel =
    document.getElementById("categoryLabel");

const categoryTitle =
    document.getElementById("categoryTitle");

const categoryDescription =
    document.getElementById("categoryDescription");

const playerFrame =
    document.getElementById("playerFrame");

const playerName =
    document.getElementById("playerName");

const playerCategory =
    document.getElementById("playerCategory");

const playerDescription =
    document.getElementById("playerDescription");

const playerFavorite =
    document.getElementById("playerFavorite");

const darkModeToggle =
    document.getElementById("darkModeToggle");

const confirmExitToggle =
    document.getElementById("confirmExitToggle");

const themeButton =
    document.getElementById("themeButton");

const settingsButton =
    document.getElementById("settingsButton");

const browseButton =
    document.getElementById("browseButton");

const emptyBrowseButton =
    document.getElementById("emptyBrowseButton");

const backToGames =
    document.getElementById("backToGames");

const reloadGame =
    document.getElementById("reloadGame");


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);


async function initialize() {

    await loadSettings();

    renderFeaturedGames();

    renderAllGames();

    renderFavorites();

    setupNavigation();

    setupSearch();

    setupButtons();

    setupKeyboardShortcuts();

}


/* =========================================================
   SETTINGS / STORAGE
========================================================= */

async function loadSettings() {

    try {

        const data =
            await chrome.storage.local.get([
                "favorites",
                "darkMode",
                "confirmExit"
            ]);


        if (Array.isArray(data.favorites)) {

            favorites =
                data.favorites;

        }


        if (
            typeof data.darkMode ===
            "boolean"
        ) {

            darkModeToggle.checked =
                data.darkMode;

        }


        if (
            typeof data.confirmExit ===
            "boolean"
        ) {

            confirmExitToggle.checked =
                data.confirmExit;

        }


        applyTheme();

    } catch (error) {

        console.error(
            "Could not load settings:",
            error
        );

    }

}


async function saveSettings() {

    try {

        await chrome.storage.local.set({

            favorites: favorites,

            darkMode:
                darkModeToggle.checked,

            confirmExit:
                confirmExitToggle.checked

        });

    } catch (error) {

        console.error(
            "Could not save settings:",
            error
        );

    }

}


/* =========================================================
   THEME
========================================================= */

function applyTheme() {

    if (darkModeToggle.checked) {

        document.body.classList.remove("light");

    } else {

        document.body.classList.add("light");

    }

}


darkModeToggle.addEventListener(
    "change",
    async () => {

        applyTheme();

        await saveSettings();

    }
);


themeButton.addEventListener(
    "click",
    async () => {

        darkModeToggle.checked =
            !darkModeToggle.checked;

        applyTheme();

        await saveSettings();

    }
);


confirmExitToggle.addEventListener(
    "change",
    async () => {

        await saveSettings();

    }
);


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item[data-page]"
        );


    navItems.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const page =
                    button.dataset.page;

                navigateTo(page);

            }
        );

    });


    const viewAllButtons =
        document.querySelectorAll(
            ".view-all[data-page]"
        );


    viewAllButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                navigateTo(
                    button.dataset.page
                );

            }
        );

    });


    const categoryButtons =
        document.querySelectorAll(
            "[data-category]"
        );


    categoryButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                openCategory(
                    button.dataset.category
                );

            }
        );

    });

}


function navigateTo(page) {

    if (!pages[page]) {

        return;

    }


    currentPage = page;

    currentCategory = null;


    Object.values(pages).forEach(
        (pageElement) => {

            pageElement.classList.remove(
                "active"
            );

        }
    );


    pages[page].classList.add(
        "active"
    );


    updateNavigation(page);


    if (page === "games") {

        renderAllGames();

    }


    if (page === "favorites") {

        renderFavorites();

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function updateNavigation(page) {

    const navItems =
        document.querySelectorAll(
            ".nav-item[data-page]"
        );


    navItems.forEach((button) => {

        button.classList.toggle(
            "active",
            button.dataset.page === page
        );

    });

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    searchInput.addEventListener(
        "input",
        () => {

            searchQuery =
                searchInput.value
                    .trim()
                    .toLowerCase();


            if (searchQuery.length > 0) {

                showSearchResults();

            } else {

                if (
                    currentPage ===
                    "games"
                ) {

                    renderAllGames();

                }

            }

        }
    );

}


function showSearchResults() {

    const results =
        getFilteredGames(
            GAMES
        );


    Object.values(pages).forEach(
        (pageElement) => {

            pageElement.classList.remove(
                "active"
            );

        }
    );


    pages.games.classList.add(
        "active"
    );


    currentPage = "games";

    currentCategory = null;

    updateNavigation("games");


    renderGameList(
        allGames,
        results,
        "No games found."
    );

}


/* =========================================================
   FILTERING
========================================================= */

function getFilteredGames(games) {

    if (!searchQuery) {

        return games;

    }


    return games.filter((game) => {

        const searchableText = [

            game.title,

            game.category,

            game.description

        ]
            .join(" ")
            .toLowerCase();


        return searchableText.includes(
            searchQuery
        );

    });

}


/* =========================================================
   FEATURED GAMES
========================================================= */

function renderFeaturedGames() {

    const games =
        GAMES.slice(0, 6);


    renderGameList(
        featuredGames,
        games,
        "No featured games available."
    );

}


/* =========================================================
   ALL GAMES
========================================================= */

function renderAllGames() {

    const games =
        getFilteredGames(GAMES);


    renderGameList(
        allGames,
        games,
        "No games found."
    );

}


/* =========================================================
   FAVORITES
========================================================= */

function renderFavorites() {

    const games =
        GAMES.filter((game) => {

            return favorites.includes(
                game.id
            );

        });


    if (games.length === 0) {

        favoriteGames.innerHTML = "";

        emptyFavorites.classList.remove(
            "hidden"
        );

        return;

    }


    emptyFavorites.classList.add(
        "hidden"
    );


    renderGameList(
        favoriteGames,
        games,
        "No favorites yet."
    );

}


/* =========================================================
   GAME LIST
========================================================= */

function renderGameList(
    container,
    games,
    emptyMessage
) {

    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (
        !games ||
        games.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎮</div>

                <h2>
                    ${escapeHTML(emptyMessage)}
                </h2>

                <p>
                    Try another search or browse
                    a different category.
                </p>
            </div>
        `;

        return;

    }


    games.forEach((game) => {

        container.appendChild(
            createGameCard(game)
        );

    });

}


/* =========================================================
   GAME CARD
========================================================= */

function createGameCard(game) {

    const card =
        document.createElement("article");


    card.className =
        "game-card";


    card.dataset.gameId =
        game.id;


    const isFavorite =
        favorites.includes(
            game.id
        );


    card.innerHTML = `
        <div class="game-image">

            <span class="game-emoji">
                ${escapeHTML(
                    game.emoji || "🎮"
                )}
            </span>

            <button
                class="favorite-button ${
                    isFavorite
                        ? "is-favorite"
                        : ""
                }"
                type="button"
                aria-label="${
                    isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                }"
                title="${
                    isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                }"
            >
                ${
                    isFavorite
                        ? "★"
                        : "☆"
                }
            </button>

        </div>


        <div class="game-info">

            <h3>
                ${escapeHTML(game.title)}
            </h3>

            <p>
                ${escapeHTML(
                    game.description ||
                    "Play this game on GummyCoder."
                )}
            </p>


            <div class="game-meta">

                <span class="game-category">
                    ${escapeHTML(
                        game.category ||
                        "Game"
                    )}
                </span>

                <span class="play-label">
                    Play →
                </span>

            </div>

        </div>
    `;


    const favoriteButton =
        card.querySelector(
            ".favorite-button"
        );


    favoriteButton.addEventListener(
        "click",
        async (event) => {

            event.stopPropagation();

            await toggleFavorite(
                game.id
            );

        }
    );


    card.addEventListener(
        "click",
        () => {

            openGame(game);

        }
    );


    return card;

}


/* =========================================================
   FAVORITE TOGGLE
========================================================= */

async function toggleFavorite(gameId) {

    const index =
        favorites.indexOf(
            gameId
        );


    if (index === -1) {

        favorites.push(gameId);

    } else {

        favorites.splice(
            index,
            1
        );

    }


    await saveSettings();


    renderFeaturedGames();

    renderAllGames();

    renderFavorites();


    if (currentCategory) {

        renderCategoryGames(
            currentCategory
        );

    }


    if (
        currentGame &&
        currentGame.id === gameId
    ) {

        updatePlayerFavorite();

    }

}


/* =========================================================
   CATEGORY
========================================================= */

function openCategory(category) {

    currentCategory =
        category;


    currentPage =
        "category";


    Object.values(pages).forEach(
        (pageElement) => {

            pageElement.classList.remove(
                "active"
            );

        }
    );


    pages.category.classList.add(
        "active"
    );


    updateNavigation(
        "category"
    );


    categoryLabel.textContent =
        category.toUpperCase();


    categoryTitle.textContent =
        category;


    categoryDescription.textContent =
        getCategoryDescription(
            category
        );


    renderCategoryGames(
        category
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function renderCategoryGames(category) {

    const games =
        GAMES.filter(
            (game) =>
                game.category
                    .toLowerCase() ===
                category.toLowerCase()
        );


    renderGameList(
        categoryGames,
        games,
        `No ${category} games yet.`
    );

}


function getCategoryDescription(
    category
) {

    const descriptions = {

        Action:
            "Fast-paced games built for action.",

        Arcade:
            "Quick, fun games that are easy to pick up.",

        Racing:
            "Get behind the wheel and put your skills to the test.",

        Puzzle:
            "Challenge your brain and solve something clever.",

        Sports:
            "Compete, score and chase the win."

    };


    return (
        descriptions[category] ||
        "Browse games in this category."
    );

}


/* =========================================================
   OPEN GAME
========================================================= */

function openGame(game) {

    if (!game || !game.url) {

        console.error(
            "Game has no URL:",
            game
        );

        return;

    }


    currentGame =
        game;


    currentPage =
        "player";


    Object.values(pages).forEach(
        (pageElement) => {

            pageElement.classList.remove(
                "active"
            );

        }
    );


    pages.player.classList.add(
        "active"
    );


    playerName.textContent =
        game.title;


    playerCategory.textContent =
        (
            game.category ||
            "GAME"
        ).toUpperCase();


    playerDescription.textContent =
        game.description ||
        "Enjoy this game on GummyCoder.";


    updatePlayerFavorite();


    playerFrame.src =
        game.url;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   PLAYER FAVORITE
========================================================= */

function updatePlayerFavorite() {

    if (!currentGame) {

        return;

    }


    const isFavorite =
        favorites.includes(
            currentGame.id
        );


    playerFavorite.textContent =
        isFavorite
            ? "★"
            : "☆";


    playerFavorite.classList.toggle(
        "is-favorite",
        isFavorite
    );


    playerFavorite.title =
        isFavorite
            ? "Remove from favorites"
            : "Add to favorites";

}


playerFavorite.addEventListener(
    "click",
    async () => {

        if (!currentGame) {

            return;

        }


        await toggleFavorite(
            currentGame.id
        );

    }
);


/* =========================================================
   PLAYER CONTROLS
========================================================= */

backToGames.addEventListener(
    "click",
    () => {

        if (
            confirmExitToggle.checked &&
            currentGame &&
            playerFrame.src
        ) {

            const leave =
                window.confirm(
                    "Leave this game?"
                );


            if (!leave) {

                return;

            }

        }


        playerFrame.src =
            "about:blank";


        currentGame = null;


        navigateTo("games");

    }
);


reloadGame.addEventListener(
    "click",
    () => {

        if (!currentGame) {

            return;

        }


        playerFrame.src =
            currentGame.url;

    }
);


/* =========================================================
   BUTTONS
========================================================= */

function setupButtons() {

    browseButton.addEventListener(
        "click",
        () => {

            navigateTo("games");

        }
    );


    emptyBrowseButton.addEventListener(
        "click",
        () => {

            navigateTo("games");

        }
    );


    settingsButton.addEventListener(
        "click",
        () => {

            navigateTo("settings");

        }
    );

}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

function setupKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        (event) => {

            /*
             * Press "/" to focus search.
             */

            if (
                event.key === "/" &&
                document.activeElement !==
                    searchInput
            ) {

                event.preventDefault();

                searchInput.focus();

            }


            /*
             * Escape clears search.
             */

            if (
                event.key === "Escape"
            ) {

                if (
                    document.activeElement ===
                    searchInput
                ) {

                    searchInput.value =
                        "";

                    searchQuery =
                        "";

                    searchInput.blur();

                    if (
                        currentPage ===
                        "games"
                    ) {

                        renderAllGames();

                    }

                }

            }

        }
    );

}


/* =========================================================
   UTILITY
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   HANDLE POPUP RESIZE / REOPEN
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        if (
            currentGame &&
            confirmExitToggle &&
            confirmExitToggle.checked
        ) {

            playerFrame.src =
                "about:blank";

        }

    }
);
