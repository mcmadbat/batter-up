$(function () {
  let players = getPlayerData()

  updateAutocomplete(players)
})

function updateAutocomplete(playerData) {
  $('#nameInput').autocomplete({
    minLength: 2,
    source: playerData,
    messages: {
      noResults: '',
      results: function () {}
    },
    focus: function (event, ui) {
      $('#nameInput').val(ui.item.name)
      return false
    },
    select: function (event, ui) {
      $('#nameInput').val(ui.item.name)
      $('#playerId').val(ui.item.id)

      return false
    }
  })
    .autocomplete('instance')._renderItem = function (ul, item) {
      return $('<li>')
        .append(`<div>${item.label} <i>${item.team}</i></div>`)
        .appendTo(ul)
    }
}
