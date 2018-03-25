$( function() {
  let players = getPlayerData()

  const positionMap = [
    'n/a',
    'P',
    'C',
    '1B',
    '2B',
    '3B',
    'SS',
    'LF',
    'CF',
    'RF',
    'DH'
  ]

  $( "#nameInput" ).autocomplete({
    minLength: 2,
    source: players,
    messages: {
      noResults: '',
      results: function() {}
    },
    focus: function( event, ui ) {
      $( "#nameInput" ).val( ui.item.name )
      return false
    },
    select: function( event, ui ) {
      $( "#nameInput" ).val( ui.item.name )
      $( "#playerId" ).val( ui.item.id )

      return false
    }
  })
  .autocomplete( "instance" )._renderItem = function( ul, item ) {
    return $( "<li>" )
      .append(`<div>${item.label} <i>${positionMap[parseInt(item.position)]}</i></div>`)
      .appendTo( ul )
  }
})