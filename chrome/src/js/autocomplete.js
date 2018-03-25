$( function() {
  let players = getPlayerData()

  $( "#nameInput" ).autocomplete({
    minLength: 2,
    source: players,
    messages: {
      noResults: '',
      results: function() {}
    },
    focus: function( event, ui ) {
      $( "#nameInput" ).val( ui.item.label )
      return false
    },
    select: function( event, ui ) {
      $( "#nameInput" ).val( ui.item.label )
      $( "#playerId" ).val( ui.item.playerId )
      // $( "#player-description" ).html( ui.item.desc )
      // $( "#player-icon" ).attr( "src", "icons/" + ui.item.icon )

      return false
    }
  })
  .autocomplete( "instance" )._renderItem = function( ul, item ) {
    return $( "<li>" )
      .append( "<div>" + item.label + "<br>" + item.desc + "</div>" )
      .appendTo( ul )
  }
})