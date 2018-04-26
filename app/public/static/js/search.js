/**
* Live search filter
*
* @author  Bas Kager
* @version 1.0
* @since   25-04-2018
*/
(function () {
    const input = document.querySelector('#search');
    const mainContainer = document.querySelector('#main');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const thumbnailRows = document.querySelectorAll('.thumbnail-row');

    input.addEventListener("focus", event => {
        for(var i = 0; i <= thumbnails.length -1; i++ ) {
            thumbnails[i].classList.add("faded");
        }
    })

    input.addEventListener("blur", event => {
        var searchResults = document.querySelectorAll('.searchResult');

        for(var i = 0; i <= searchResults.length -1; i++ ) {
            main.removeChild(searchResults[i]);
        }

        for(var i = 0; i <= thumbnailRows.length -1; i++ ) {
            thumbnailRows[i].classList.remove("hide");
        }


        for(var i = 0; i <= thumbnails.length -1; i++ ) {
            thumbnails[i].classList.remove("faded");
        }
    })

    input.addEventListener("input", event => {
        filter = input.value.toUpperCase();
        results = 0;

        for(var i = 0; i <= thumbnails.length -1; i++ ) {

            var thumbnail = thumbnails[i];
            var title = thumbnail.querySelector('#title').innerText.toUpperCase();
            // var tags = thumbnail.querySelectorAll('#tags');

            for(var a = 0; a <= tags.length -1; a++ ) {
                console.log(tags[a].innerText);
            }

            if(title.indexOf(filter) > -1 || title.indexOf(filter) > -1) {
                thumbnail.classList.remove("hide", "faded");
                results++;
            } else {
                thumbnail.classList.add("hide");
            }

            if(filter === "") {
                thumbnail.classList.add("faded");
            }
            // thumbnailRows[i].classList.add("hide");
        }
        if(results === 1) {
            thumbnailRows[0].classList.add("oneResult");
        } else {
            thumbnailRows[0].classList.remove("oneResult");
        }


        // var newRow = document.createElement("section");
        // newRow.classList.add("center", "flex", "thumbnail-row", "searchResult", "oneResult");

        // var clone = thumbnails[1].cloneNode(true);
        // clone.classList.remove("faded");

        // newRow.appendChild(clone);

        // mainContainer.appendChild(newRow);
    })
})();