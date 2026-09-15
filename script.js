const animeContainer = document.querySelector(".anime-container");

const loading = document.querySelector("#loading");

const searchInput = document.querySelector("#searchInput");

const searchButton = document.querySelector("#searchButton");

const sortSelect = document.querySelector("#sortSelect");

const genreSelect = document.querySelector("#genreSelect");

const loadMoreButton = document.querySelector("#loadMoreButton");

const sectionTitle = document.querySelector("#sectionTitle");

const animeModal = document.querySelector("#animeModal");

const closeModal = document.querySelector("#closeModal");

const modalBody = document.querySelector("#modalBody");

const favoritesLink = document.querySelector("#favoritesLink");

const homeLink = document.querySelector("#homeLink");

const API_URL = "https://graphql.anilist.co";

let currentPage = 1;

const perPage = 16;

let hasNextPage = true;

let currentMode = "popular";

let currentSearch = "";

let animeData = [];

let originalAnimeData = [];

let searchTimeout;

function getFavorites() {

    const favorites =
        JSON.parse(localStorage.getItem("animeFavorites")) || [];

    return favorites;
}

function saveFavorites(favorites) {

    localStorage.setItem(
        "animeFavorites",
        JSON.stringify(favorites)
    );
}

function toggleFavorite(animeId) {

    let favorites = getFavorites();

    if (favorites.includes(animeId)) {

        favorites = favorites.filter(
            id => id !== animeId
        );

    } else {

        favorites.push(animeId);
    }

    saveFavorites(favorites);

    renderAnimeCards(animeData);
}

async function fetchAniList(query, variables = {}) {

    const response = await fetch(API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },

        body: JSON.stringify({
            query: query,
            variables: variables
        })
    });

    const data = await response.json();

    if (data.errors) {

        throw new Error(
            data.errors[0].message
        );
    }

    return data.data;
}

async function getPopularAnime() {

    loading.classList.remove("error-message");

    loading.textContent = "Loading anime...";

    loading.style.display = "block";

    const query = `

        query ($page: Int, $perPage: Int) {

            Page(
                page: $page,
                perPage: $perPage
            ) {

                pageInfo {
                    hasNextPage
                }

                media(
                    type: ANIME,
                    sort: POPULARITY_DESC
                ) {

                    id

                    title {
                        romaji
                        english
                    }

                    coverImage {
                        large
                    }

                    averageScore

                    genres

                    description

                    episodes

                    status

                    format

                    season

                    seasonYear

                    studios {
                        nodes {
                            name
                        }
                    }
                }
            }
        }

    `;

    try {

        const data = await fetchAniList(
            query,
            {
                page: currentPage,
                perPage: perPage
            }
        );

        const newAnime =
            data.Page.media;

        hasNextPage =
            data.Page.pageInfo.hasNextPage;

        animeData = [
            ...animeData,
            ...newAnime
        ];

        originalAnimeData = [
            ...animeData
        ];

        loading.style.display = "none";

        renderAnimeCards(animeData);

        updateGenreOptions(animeData);

        updateLoadMoreButton();

    } catch (error) {

        console.error(
            "Error loading anime:",
            error
        );

        loading.classList.add("error-message");

        loading.textContent =
            "Unable to load anime. Please try again.";

    }
}

async function searchAnime() {

    const query =
        searchInput.value.trim();

    if (query === "") {

        resetToPopular();

        return;
    }

    currentMode = "search";

    currentSearch = query;

    currentPage = 1;

    animeData = [];

    originalAnimeData = [];

    sectionTitle.textContent =
        `Search Results for "${query}"`;

    animeContainer.innerHTML = "";

    loading.classList.remove("error-message");

    loading.textContent =
        "Searching...";

    loading.style.display =
        "block";

    const queryDocument = `

        query ($page: Int, $perPage: Int, $search: String) {

            Page(
                page: $page,
                perPage: $perPage
            ) {

                pageInfo {
                    hasNextPage
                }

                media(
                    search: $search,
                    type: ANIME
                ) {

                    id

                    title {
                        romaji
                        english
                    }

                    coverImage {
                        large
                    }

                    averageScore

                    genres

                    description

                    episodes

                    status

                    format

                    season

                    seasonYear

                    studios {
                        nodes {
                            name
                        }
                    }
                }
            }
        }

    `;

    try {

        const data = await fetchAniList(
            queryDocument,
            {
                page: currentPage,
                perPage: perPage,
                search: query
            }
        );

        const results =
            data.Page.media;

        hasNextPage =
            data.Page.pageInfo.hasNextPage;

        loading.style.display =
            "none";

        if (results.length === 0) {

            loading.textContent =
                "No anime found.";

            loading.style.display =
                "block";

            loadMoreButton.style.display =
                "none";

            return;
        }

        animeData =
            results;

        originalAnimeData =
            [...results];

        renderAnimeCards(
            animeData
        );

        updateGenreOptions(
            animeData
        );

        updateLoadMoreButton();

    } catch (error) {

        console.error(
            "Search error:",
            error
        );

        loading.classList.add(
            "error-message"
        );

        loading.textContent =
            "Unable to search anime. Please try again.";

    }
}

function debounceSearch() {

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(
        () => {

            if (
                searchInput.value.trim() !== ""
            ) {

                searchAnime();

            }

        },
        500
    );
}

function renderAnimeCards(animeList) {

    animeContainer.innerHTML = "";

    if (animeList.length === 0) {

        loading.textContent =
            "No anime found.";

        loading.style.display =
            "block";

        return;
    }

    loading.style.display =
        "none";

    animeList.forEach(
        anime => {

            const card =
                createAnimeCard(anime);

            animeContainer.appendChild(
                card
            );
        }
    );
}

function createAnimeCard(anime) {

    const card =
        document.createElement("div");

    card.classList.add(
        "anime-card"
    );

    const favorites =
        getFavorites();

    const isFavorite =
        favorites.includes(anime.id);

    const title =
        anime.title.english ||
        anime.title.romaji ||
        "Unknown Title";

    const score =
        anime.averageScore
            ? anime.averageScore / 10
            : "N/A";

    const genres =
        anime.genres &&
            anime.genres.length > 0
            ? anime.genres
                .slice(0, 3)
                .join(" • ")
            : "No genres";

    const description =
        cleanDescription(
            anime.description
        );

    card.innerHTML = `

        <div class="card-image-container">

            <img
                src="${anime.coverImage.large}"
                alt="${title}"
            >

            <button
                class="favorite-button"
                data-id="${anime.id}"
                type="button"
            >
                ${isFavorite ? "♥" : "♡"}
            </button>

        </div>

        <div class="anime-info">

            <h3>
                ${title}
            </h3>

            <p class="anime-author">

                ${anime.studios &&
            anime.studios.nodes.length > 0

            ? anime.studios.nodes[0].name

            : "Unknown Studio"
        }

            </p>

            <p>
                ⭐ ${score}
            </p>

            <p>
                ${genres}
            </p>

            <p class="anime-description">

                ${description
            ? description.substring(0, 120) + "..."
            : "No description available."
        }

            </p>

        </div>

    `;

    card.addEventListener(
        "click",
        () => {

            openAnimeDetails(
                anime.id
            );

        }
    );

    const favoriteButton =
        card.querySelector(
            ".favorite-button"
        );

    favoriteButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            toggleFavorite(
                anime.id
            );

        }
    );

    return card;
}

function cleanDescription(description) {

    if (!description) {
        return "";
    }

    return description
        .replace(/<[^>]*>/g, "")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, "&");
}

function updateGenreOptions(animeList) {

    const genres =
        new Set();

    animeList.forEach(
        anime => {

            if (!anime.genres) {
                return;
            }

            anime.genres.forEach(
                genre => {

                    genres.add(
                        genre
                    );

                }
            );

        }
    );

    genreSelect.innerHTML = `

        <option value="all">
            All Genres
        </option>

    `;

    [...genres]
        .sort()
        .forEach(
            genre => {

                const option =
                    document.createElement("option");

                option.value =
                    genre;

                option.textContent =
                    genre;

                genreSelect.appendChild(
                    option
                );

            }
        );
}

function filterAnime() {

    const selectedGenre =
        genreSelect.value;

    if (selectedGenre === "all") {

        applySorting(
            animeData
        );

        return;
    }

    const filtered =
        animeData.filter(
            anime => {

                return anime.genres &&
                    anime.genres.includes(
                        selectedGenre
                    );

            }
        );

    renderAnimeCards(
        filtered
    );
}

function sortAnime() {

    const selectedSort =
        sortSelect.value;

    if (selectedSort === "default") {

        renderAnimeCards(
            originalAnimeData
        );

        return;
    }

    if (selectedSort === "az") {

        const sorted =
            [...animeData].sort(
                (a, b) => {

                    const titleA =
                        (
                            a.title.english ||
                            a.title.romaji
                        ).toLowerCase();

                    const titleB =
                        (
                            b.title.english ||
                            b.title.romaji
                        ).toLowerCase();

                    return titleA.localeCompare(
                        titleB
                    );

                }
            );

        renderAnimeCards(
            sorted
        );
    }
}

function applySorting(list) {

    if (
        sortSelect.value === "az"
    ) {

        const sorted =
            [...list].sort(
                (a, b) => {

                    const titleA =
                        (
                            a.title.english ||
                            a.title.romaji
                        ).toLowerCase();

                    const titleB =
                        (
                            b.title.english ||
                            b.title.romaji
                        ).toLowerCase();

                    return titleA.localeCompare(
                        titleB
                    );

                }
            );

        renderAnimeCards(
            sorted
        );

        return;
    }

    renderAnimeCards(
        list
    );
}

async function loadMoreAnime() {

    if (!hasNextPage) {
        return;
    }

    currentPage++;

    loading.classList.remove(
        "error-message"
    );

    loading.textContent =
        "Loading more anime...";

    loading.style.display =
        "block";

    try {

        const query = `

            query ($page: Int, $perPage: Int) {

                Page(
                    page: $page,
                    perPage: $perPage
                ) {

                    pageInfo {
                        hasNextPage
                    }

                    media(
                        type: ANIME,
                        sort: POPULARITY_DESC
                    ) {

                        id

                        title {
                            romaji
                            english
                        }

                        coverImage {
                            large
                        }

                        averageScore

                        genres

                        description

                        episodes

                        status

                        format

                        season

                        seasonYear

                        studios {
                            nodes {
                                name
                            }
                        }
                    }
                }
            }

        `;

        const data =
            await fetchAniList(
                query,
                {
                    page: currentPage,
                    perPage: perPage
                }
            );

        const newAnime =
            data.Page.media;

        animeData.push(
            ...newAnime
        );

        originalAnimeData.push(
            ...newAnime
        );

        hasNextPage =
            data.Page.pageInfo.hasNextPage;

        loading.style.display =
            "none";

        renderAnimeCards(
            animeData
        );

        updateGenreOptions(
            animeData
        );

        updateLoadMoreButton();

    } catch (error) {

        console.error(
            "Load more error:",
            error
        );

        loading.classList.add(
            "error-message"
        );

        loading.textContent =
            "Unable to load more anime.";

    }
}

function updateLoadMoreButton() {

    if (
        hasNextPage &&
        currentMode !== "favorites"
    ) {

        loadMoreButton.style.display =
            "block";

    } else {

        loadMoreButton.style.display =
            "none";

    }
}

async function openAnimeDetails(animeId) {

    animeModal.classList.add(
        "active"
    );

    modalBody.innerHTML = `
        <p>Loading anime details...</p>
    `;

    const query = `

        query ($id: Int) {

            Media(id: $id, type: ANIME) {

                id

                title {
                    romaji
                    english
                    native
                }

                coverImage {
                    extraLarge
                }

                bannerImage

                averageScore

                genres

                description

                episodes

                duration

                status

                format

                season

                seasonYear

                startDate {
                    year
                    month
                    day
                }

                studios {
                    nodes {
                        name
                    }
                }

                siteUrl

            }
        }

    `;

    try {

        const data =
            await fetchAniList(
                query,
                {
                    id: animeId
                }
            );

        const anime =
            data.Media;

        renderAnimeDetails(
            anime
        );

    } catch (error) {

        console.error(
            "Detail error:",
            error
        );

        modalBody.innerHTML = `
            <p>
                Unable to load anime details.
            </p>
        `;

    }
}

function renderAnimeDetails(anime) {

    const title =
        anime.title.english ||
        anime.title.romaji;

    const score =
        anime.averageScore
            ? anime.averageScore / 10
            : "N/A";

    const description =
        cleanDescription(
            anime.description
        );

    const studio =
        anime.studios &&
            anime.studios.nodes.length > 0
            ? anime.studios.nodes[0].name
            : "Unknown Studio";

    modalBody.innerHTML = `

        <div class="detail-content">

            <img
                src="${anime.coverImage.extraLarge}"
                alt="${title}"
                class="detail-image"
            >

            <div class="detail-info">

                <h2>
                    ${title}
                </h2>

                <p>
                    ⭐ ${score}
                </p>

                <p>
                    <strong>Studio:</strong>
                    ${studio}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${anime.status || "Unknown"}
                </p>

                <p>
                    <strong>Format:</strong>
                    ${anime.format || "Unknown"}
                </p>

                <p>
                    <strong>Episodes:</strong>
                    ${anime.episodes || "Unknown"}
                </p>

                <p>
                    <strong>Duration:</strong>
                    ${anime.duration
            ? anime.duration + " min"
            : "Unknown"}
                </p>

                <p>
                    <strong>Genres:</strong>
                    ${anime.genres &&
            anime.genres.length
            ? anime.genres.join(" • ")
            : "None"
        }
                </p>

                <p class="detail-description">
                    ${description ||
        "No description available."
        }
                </p>

                ${anime.siteUrl
            ? `
                            <a
                                href="${anime.siteUrl}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View on AniList
                            </a>
                        `
            : ""
        }

                <div class="comments-section">

                    <h3>
                        Reviews / Comments
                    </h3>

                    <div
                        id="commentsList"
                    ></div>

                    <textarea
                        id="commentInput"
                        placeholder="Write your comment..."
                    ></textarea>

                    <button
                        id="commentButton"
                        type="button"
                    >
                        Add Comment
                    </button>

                </div>

            </div>

        </div>

    `;

    loadComments(
        anime.id
    );

    document
        .querySelector("#commentButton")
        .addEventListener(
            "click",
            () => {

                addComment(
                    anime.id
                );

            }
        );
}

function getComments(animeId) {

    const allComments =
        JSON.parse(
            localStorage.getItem(
                "animeComments"
            )
        ) || {};

    return allComments[animeId] || [];
}

function saveComments(allComments) {

    localStorage.setItem(
        "animeComments",
        JSON.stringify(allComments)
    );
}

function addComment(animeId) {

    const input =
        document.querySelector(
            "#commentInput"
        );

    const text =
        input.value.trim();

    if (text === "") {
        return;
    }

    const allComments =
        JSON.parse(
            localStorage.getItem(
                "animeComments"
            )
        ) || {};

    if (!allComments[animeId]) {

        allComments[animeId] = [];

    }

    allComments[animeId].push({

        text: text,

        date:
            new Date().toLocaleString()

    });

    saveComments(
        allComments
    );

    input.value = "";

    loadComments(
        animeId
    );
}

function loadComments(animeId) {

    const commentsList =
        document.querySelector(
            "#commentsList"
        );

    if (!commentsList) {
        return;
    }

    const comments =
        getComments(
            animeId
        );

    if (comments.length === 0) {

        commentsList.innerHTML = `
            <p>
                No comments yet.
            </p>
        `;

        return;
    }

    commentsList.innerHTML =
        comments.map(
            comment => `

                <div class="comment">

                    <p>
                        ${escapeHTML(
                comment.text
            )}
                    </p>

                    <small>
                        ${comment.date}
                    </small>

                </div>

            `
        ).join("");
}

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;
}

async function showFavorites() {

    currentMode =
        "favorites";

    sectionTitle.textContent =
        "My Favorites";

    animeContainer.innerHTML = "";

    loading.textContent =
        "Loading favorites...";

    loading.style.display =
        "block";

    loadMoreButton.style.display =
        "none";

    const favorites =
        getFavorites();

    if (favorites.length === 0) {

        loading.textContent =
            "You haven't added any favorites yet.";

        return;
    }

    const query = `

        query ($ids: [Int]) {

            Page(perPage: 50) {

                media(
                    id_in: $ids,
                    type: ANIME
                ) {

                    id

                    title {
                        romaji
                        english
                    }

                    coverImage {
                        large
                    }

                    averageScore

                    genres

                    description

                    episodes

                    status

                    format

                    season

                    seasonYear

                    studios {
                        nodes {
                            name
                        }
                    }
                }
            }
        }

    `;

    try {

        const data =
            await fetchAniList(
                query,
                {
                    ids: favorites
                }
            );

        animeData =
            data.Page.media;

        originalAnimeData =
            [...animeData];

        loading.style.display =
            "none";

        renderAnimeCards(
            animeData
        );

    } catch (error) {

        console.error(
            "Favorites error:",
            error
        );

        loading.classList.add(
            "error-message"
        );

        loading.textContent =
            "Unable to load favorites.";

    }
}

function resetToPopular() {

    currentMode =
        "popular";

    currentSearch =
        "";

    currentPage =
        1;

    animeData =
        [];

    originalAnimeData =
        [];

    searchInput.value =
        "";

    sectionTitle.textContent =
        "Popular Anime";

    getPopularAnime();
}

function closeAnimeModal() {

    animeModal.classList.remove(
        "active"
    );
}

searchButton.addEventListener(
    "click",
    searchAnime
);

searchInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            searchAnime();

        }

    }
);

searchInput.addEventListener(
    "input",
    debounceSearch
);

sortSelect.addEventListener(
    "change",
    sortAnime
);

genreSelect.addEventListener(
    "change",
    filterAnime
);

loadMoreButton.addEventListener(
    "click",
    loadMoreAnime
);

closeModal.addEventListener(
    "click",
    closeAnimeModal
);

animeModal.addEventListener(
    "click",
    event => {

        if (
            event.target === animeModal
        ) {

            closeAnimeModal();

        }

    }
);

favoritesLink.addEventListener(
    "click",
    event => {

        event.preventDefault();

        showFavorites();

    }
);

homeLink.addEventListener(
    "click",
    event => {

        event.preventDefault();

        resetToPopular();

    }
);

getPopularAnime();