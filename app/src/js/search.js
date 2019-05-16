/**
* Live search filter
*
* @author  Bas Kager
* @version 1.1
* @since   13-02-2019
*/
(function () {
    // The input element of the search box
    const input = document.querySelector("#search");

    // All of the items to search against
    const search_items = document.querySelectorAll(".searchable");

    // Gets the corresponding keycode on a "keypress" event
    // (for compatibility with older browsers)
    function getKeyFromEvent(event) {
        return event.which || event.keyCode;
    }

    // Checks if there is a match with the given query in a specific thumbnail
    function isMatchInThumbnail(query, searchableRecords) {
        for (var j = 0; j <= searchableRecords.length - 1; j++) {
            var record = searchableRecords[j];
            // Check if query matches this keyword
            if (record.indexOf(query) > -1) return true;
        }
        return false;
    }

    // Search all the "search items" with the given query
    function search(query) {
        if (query !== "") {
            // Loop through each thumbnail
            for (var i = 0; i <= search_items.length - 1; i++) {
                // Fetch the current thumbnail
                var thumbnail = search_items[i];

                // Define which entries of the thumbnail should be searched
                var title = thumbnail.querySelector("#title").innerText.toUpperCase();
                var postedBy = thumbnail.querySelector("#name").innerText.toUpperCase();
                var date = thumbnail.querySelector("#dateDue").innerText.toUpperCase();

                var searchableRecords = [title, postedBy, date];

                // Check for a match in this thumbnail
                var match = isMatchInThumbnail(query, searchableRecords);
                

                if (match === true) showThumbnail(thumbnail);
                else hideThumbnail(thumbnail);
            }
        } else resetApplicationState();
    }

    // Reset the entire application state
    function resetApplicationState() {
        input.blur();
        showAllThumbnails();
    }

    // Show all thumbnails
    function showAllThumbnails() {
        for (var i = 0; i <= search_items.length - 1; i++) {
            var thumbnail = search_items[i];
            showThumbnail(thumbnail);
        }
    }
    // Show a specific thumbnail
    function showThumbnail(thumbnail) {
        thumbnail.classList.remove("hide", "faded");
    }

    // Fade the thubmnails
    function fadeAllThumbnails() {
        for (var i = 0; i <= search_items.length - 1; i++) {
            search_items[i].classList.add("faded");
        }
    }

    // Hide a thumbnail
    function hideThumbnail(thumbnail) {
        thumbnail.classList.add("hide");
    }

    // Fade search items when the input gets focus
    input.addEventListener("focus", event => {
        fadeAllThumbnails();
    });

    // Reset appliocation state when input is exited without values
    input.addEventListener("blur", event => {
        if(input.value === "") resetApplicationState();
    });

    // Perform a search action on each input
    input.addEventListener("input", event => {
        var query = input.value.toUpperCase();
        search(query);
    });

    // General keypress actions
    document.addEventListener("keydown", function (event) {
        var key = getKeyFromEvent(event);

        // Ignore ctrl+key combination
        // if (!event.ctrlKey) {
            // When a user starts typing, automatically focus on the search input box
            if ((key > 63 && key < 90 ||
                key === 8 && input.value != "" ||
                key > 47 && key < 58) &&
                !event.ctrlKey) {
                input.focus();
            }
        // }
    });

    // Actions for keypresses when focused in the searchbox
    input.addEventListener("keydown", function (event) {
        var key = getKeyFromEvent(event);
        // Remove focus from input element when "enter" or "escape" is pressed
        if (key === 27 || key === "Escape" || key === 13 || key === 17) {
            event.preventDefault();
            input.blur();
        }
    });


})();