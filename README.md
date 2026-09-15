# Anime Explorer

A responsive anime discovery website that uses the **AniList GraphQL API** to search, browse, filter, sort, and explore anime. Users can also save their favorite anime and add personal comments/reviews that persist in the browser.

## Features

* Browse popular anime
* Search for anime
* Debounced search while typing
* Load more anime using pagination
* Filter anime by genre
* Sort anime alphabetically (A–Z)
* View detailed information about an anime
* Add and remove anime from favorites
* Dedicated favorites section
* Add personal comments/reviews
* Comments persist using `localStorage`
* Favorites persist using `localStorage`
* Safe rendering of user comments using HTML escaping
* Responsive and interactive user interface

## Technologies Used

* **HTML5** — Structure of the website
* **CSS3** — Styling and responsive design
* **JavaScript (ES6+)** — Application logic and DOM manipulation
* **GraphQL** — API queries
* **AniList API** — Anime data
* **LocalStorage** — Favorites and comments persistence

## API

This project uses the AniList GraphQL API:

**API Endpoint:**

`https://graphql.anilist.co`

The application retrieves information such as:

* Anime title
* Cover image
* Average score
* Genres
* Description
* Episodes
* Status
* Format
* Season
* Studio
* Additional anime details

## Project Structure

```text
Anime-Explorer/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

## How It Works

### 1. Popular Anime

When the website loads, JavaScript sends a GraphQL request to AniList and retrieves popular anime sorted by popularity.

The application initially loads **16 anime per page**.

### 2. Search

Users can search for anime using the search bar.

The project also uses **debouncing**, which waits for the user to stop typing before sending the API request. This helps avoid sending an API request for every individual keystroke.

### 3. Genre Filter

Genres are collected dynamically from the anime currently loaded.

Users can select a genre to display only anime belonging to that genre.

### 4. Sorting

The project supports alphabetical sorting:

* Default order
* A–Z

### 5. Load More

Instead of loading a large number of anime at once, the application uses pagination.

Clicking **Load More** requests the next page from AniList and adds the results to the existing anime list.

### 6. Anime Details

Clicking an anime card opens a detail modal containing information such as:

* Title
* Score
* Studio
* Status
* Format
* Episodes
* Duration
* Genres
* Description
* AniList page

### 7. Favorites

Users can click the heart button on an anime card to add or remove it from favorites.

Favorites are stored in the browser using:

```javascript
localStorage
```

This means favorites remain available after refreshing the page.

### 8. Comments / Reviews

Users can write personal comments for individual anime.

Comments are stored in `localStorage` and are associated with the anime's ID, allowing each anime to have its own comments.

User comments are passed through an HTML escaping function before being displayed.

## LocalStorage

The project uses two main LocalStorage keys:

```text
animeFavorites
animeComments
```

### Favorites

Favorites are stored as an array of anime IDs.

### Comments

Comments are stored as an object where each anime ID contains its associated comments.

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
```

### 2. Open the Project

Navigate into the project directory:

```bash
cd Anime-Explorer
```

### 3. Run the Website

You can open `index.html` directly in a browser.

For a better development experience, use a local server such as **VS Code Live Server**.

### 4. Start Exploring

Once the website loads, you can:

1. Browse popular anime
2. Search for anime
3. Filter by genre
4. Sort results
5. Load more anime
6. Open anime details
7. Add favorites
8. Add comments/reviews

## Key JavaScript Functions

| Function               | Purpose                             |
| ---------------------- | ----------------------------------- |
| `getPopularAnime()`    | Fetches popular anime               |
| `searchAnime()`        | Searches for anime                  |
| `debounceSearch()`     | Delays search requests while typing |
| `renderAnimeCards()`   | Displays anime cards                |
| `createAnimeCard()`    | Creates an individual anime card    |
| `filterAnime()`        | Filters anime by genre              |
| `sortAnime()`          | Sorts anime alphabetically          |
| `loadMoreAnime()`      | Loads the next page                 |
| `openAnimeDetails()`   | Fetches anime details               |
| `renderAnimeDetails()` | Displays anime details              |
| `toggleFavorite()`     | Adds/removes favorites              |
| `showFavorites()`      | Displays saved favorites            |
| `addComment()`         | Saves a comment                     |
| `loadComments()`       | Displays saved comments             |
| `resetToPopular()`     | Returns to the popular anime page   |

## Future Improvements

Possible improvements for future versions include:

* User authentication
* Cloud-based favorites and comments
* Dark/light theme switcher
* More sorting options
* Anime recommendations
* Advanced filters
* Watch status tracking
* Pagination controls
* Trailer/video integration
* Better error and offline handling
* Skeleton loading animations
* Mobile navigation improvements

## Disclaimer

This project uses the **AniList GraphQL API** to retrieve anime information. Anime data is provided by AniList and is not owned by this project.

## License

This project is created for educational and portfolio purposes.
