$(function () {
  let players = getPlayerData()

  $('#nameInput').autocomplete({
    minLength: 2,
    source: players,
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
})
