/**
* Controller for card actions
*
* @author  Bas Kager
* @version 1.0
* @since   27-05-2019
*/
(function () {
  // All of the items to search against
  var cards = document.querySelectorAll(".reminder");

  function addClickEventToCard(card) {
    card.addEventListener("click", function(event) {
      event.preventDefault();
      removeReminderCard(this);
    });
  }

  function init() {
    cards = document.querySelectorAll(".reminder");

    for(var i = 0; i < cards.length; i++) {
      var card = cards[i];
      addClickEventToCard(card);
    }
  }

  function removeReminderCard(reminderCard) {
    reminderCard.classList.add("faded");
    reminderCard.classList.add("finished");
    reminderCard.querySelector("#overlayText").innerHTML = "Removing reminder";

    var key = reminderCard.getAttribute("data-key");

    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", removeReminderFromUI(reminderCard));
    oReq.open("DELETE", "http://localhost:1511/api/reminder/" + key);
    oReq.send();
  }

  function removeReminderFromUI(reminderCard) {
    setTimeout(function () {
      reminderCard.classList.add("hide");
    }, 200);
    setTimeout(function () {
      reminderCard.remove();
    }, 600);
  }

  var socket = io("127.0.0.1:1511");
  var card = document.getElementById("reminderCardCopy");
  var cardCarousel = document.getElementById("cardCarousel");
  
  socket.on("reminder", function(reminder){
      var cardClone = card.cloneNode(true);
      cardClone.classList.remove("copy");
      
      // Define which entries of the thumbnail should be searched
      var titleField = cardClone.querySelector("#title");
      var postedByField = cardClone.querySelector("#name");
      var datePostedField = cardClone.querySelector("#datePosted");
      var dateDueField = cardClone.querySelector("#dateDue");
      var avatarField = cardClone.querySelector("#avatar");

      // Set title
      titleField.innerHTML = reminder.title;
      // Set author
      postedByField.innerHTML = reminder.authorName;
      // Set date posted
      datePostedField.innerHTML = moment(reminder.timestamp).format("DD-MM-YYYY");
      // Set due data
      if(reminder.due) dateDueField.innerHTML = moment(reminder.due).format("DD-MM-YYYY");
      // Set avatar URL
      avatarField.src = "https://cdn.discordapp.com/avatars/"+reminder.authorId+"/"+reminder.avatar+".png?size=256";
      // Set ID of reminder, so it can be used in later actions
      cardClone.setAttribute("data-key", reminder._key);

      // Add click event to the card and add it to the carousel of reminders
      addClickEventToCard(cardClone);
      cardCarousel.appendChild(cardClone);

      setTimeout(function () {
          cardClone.classList.remove("hide");
          cardClone.classList.remove("faded");
      },50);
  });

  init();
})();