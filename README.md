# Hotel Listing App

> **🧪 Dummy Test Application Mode:**
> 
> If API calls fail or you want to preview the UI without backend data, you can use the built-in dummy data:
> 1. Uncomment the `dummyHotels` export in `app/services/hotel-service.ts`.
> 2. In `app/components/hotels/hotel-list.tsx`, set:
>    ```js
>    import { dummyHotels } from '../../services/hotel-service';
>    // ...
>    const displayHotels = dummyHotels;
>    ```
> This allows you to explore all UI features, dialogs, and filtering with sample hotel data, even if the API is unavailable.

A modern, feature-rich hotel search and listing application built with React, Redux Toolkit, and TypeScript.

## 🚀 Features

- **Hotel Search**: Search for hotels by destination, dates, rooms, adults, children, and more.
- **Dynamic Filtering**: Filter hotels by price range, star rating, TripAdvisor rating, board types, and property name.
- **Sorting**: Sort results by price (low to high, high to low).
- **Debounced Search**: Destination search and price range filtering are debounced for optimal API usage and smooth UX.
- **Responsive UI**: Fully responsive, mobile-friendly design with modern UI components.
- **Hotel Details Dialog**: View detailed hotel info, image gallery, facilities, room types, rates, cancellation policies, contact info, and points of interest.
- **State Persistence via Query Params**: All search/filter state is encoded in the URL, so users can share or reload and retain their search.
- **Global State Management**: Uses Redux Toolkit for robust, scalable state management.
- **Error Handling**: Graceful error messages and retry logic for failed API calls.
- **Skeleton Loading**: Beautiful skeletons for loading states, matching the card layout.

## 🏆 Core Advantages

- **User Experience**: Fast, intuitive, and visually appealing interface.
- **Shareable/Reloadable State**: All search/filter state is encoded in the URL, so users can share or reload and retain their search.
- **Performance**: Debounced API calls and efficient state updates minimize unnecessary network requests and re-renders.
- **Scalability**: Modular codebase with Redux Toolkit, hooks, and reusable UI components.
- **Robustness**: Handles missing data, API errors, and edge cases gracefully.

## 🔑 Technical Highlights

### 1. **Debouncing**
- Debounced destination search and price range filtering using a custom `useDebounce` hook.
- Reduces API calls and improves user experience.

### 2. **API Integration**
- All hotel and destination data is fetched via API calls (with dummy data fallback for demo/testing).
- API calls are triggered on search, filter, and sort changes, with proper error handling and loading states.

### 3. **Redux Global Store**
- All search, filter, and hotel data is managed in a global Redux store (Redux Toolkit).
- Enables consistent state across components and easy debugging with Redux DevTools.

### 4. **Query Params State Sync**
- All search/filter state is encoded in the URL as query params.
- On page load or retry, the app restores the Redux store from the query params, ensuring the UI is always in sync with the URL.
- Enables deep linking, sharing, and reload persistence.

### 5. **Filtering, Searching, Sorting**
- **Filtering**: Price range, star rating, TripAdvisor rating, board types, property name, and more.
- **Searching**: Destination search with debounced API calls and auto-complete.
- **Sorting**: Sort by price (asc/desc) with a select dropdown.
- **All filters and sorts are reflected in the URL and Redux store.**

### 6. **Modern UI/UX**
- Built with custom and third-party UI components (e.g., Carousel, Dialog, Skeleton, Select, Tooltip).
- Responsive grid layouts, beautiful skeletons, and accessible forms.
- Collapsible/expandable hotel descriptions for better readability.

### 7. **Error Handling & Retry**
- All API errors are caught and displayed with user-friendly messages.
- Retry button restores state from query params and re-fetches data.

## 📝 Usage Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open the app:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

4. **Search for hotels:**
   - Enter a destination, dates, rooms, adults, and children.
   - Use filters and sort options to refine your search.
   - Click on a hotel card to view detailed information.

5. **Share or reload:**
   - Copy the URL to share your search with others.
   - Reload the page to see your search restored from the URL.

## 🧩 Project Structure

- `app/components/` — UI and feature components (hotels, filters, cards, dialogs, etc.)
- `app/store/` — Redux Toolkit slices, hooks, and store setup
- `app/services/` — API service logic and dummy data
- `app/utils/` — Utility functions (e.g., price min/max, debouncing)
- `app/types/` — TypeScript types for hotels, search, etc.

## 💡 Extending the App
- Add more filters (amenities, location, etc.)
- Integrate real hotel APIs
- Add authentication and user accounts
- Enhance accessibility and internationalization

## 🤝 Contributing
Pull requests and suggestions are welcome! Please open an issue or PR for any improvements or bug fixes.

---

**Enjoy your stay with the Hotel Listing App!** 🏨✨
