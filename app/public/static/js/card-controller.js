/**
* Controller for card actions
*
* @author  Bas Kager
* @version 1.0
* @since   27-05-2019
*/
(function () {
  // All of the items to search against
  const cards = document.querySelectorAll(".reminder");

  for(var i = 0; i < cards.length; i++) {
    var card = cards[i];

    card.addEventListener("click", function(event) {
      event.preventDefault();
      var self = this;

      self.classList.add("faded");
      self.classList.add("finished");
      self.querySelector("#overlayText").innerHTML = "Removing reminder";
      setTimeout(function () {
          self.classList.add("hide");
      }, 200);
      setTimeout(function () {
        self.remove();
    }, 600);

    

    });
  }
})();