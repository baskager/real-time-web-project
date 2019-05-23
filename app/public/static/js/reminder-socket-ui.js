/**
* Socket implementation for the User Interface
*
* @author  Bas Kager
* @version 1.0
* @since   16-05-2019
*/
(function () {
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

      titleField.innerHTML = reminder.title;
      postedByField.innerHTML = reminder.authorName;
      datePostedField.innerHTML = moment(reminder.timestamp).format("DD-MM-YYYY");
      if(reminder.due) dateDueField.innerHTML = moment(reminder.due).format("DD-MM-YYYY");
      avatarField.src = "https://cdn.discordapp.com/avatars/"+reminder.authorId+"/"+reminder.avatar+".png?size=256"

      cardCarousel.appendChild(cardClone);
      setTimeout(function () {
          cardClone.classList.remove("hide")
          cardClone.classList.remove("faded")
      },50);
  
  });
})();