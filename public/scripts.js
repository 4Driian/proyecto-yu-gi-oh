$(document).ready(function () {
  const cartasPorPagina = 10;
  const $listaCartas = $('#lista-cartas');
  const $formulario = $('#form');
  const $buscador = $('#search-form');
  const $editFormContainer = $('#edit-form-container');
  const $editForm = $('#edit-form');
  const $mostrarTodas = $('#mostrar-todas');
  const $pagination = $('#card-pagination');

  let cartas = [];
  let paginacionActual = 1;
  
  cargarCartas();

  function cargarCartas() {
    $.ajax({
      url: '/cartas',
      type: 'GET',
      success: function (data) {
        cartas = data;
        cartasCreadas();
      },
      error: function (error) {
        console.log('Error al obtener la lista de cartas:', error);
      }
    });
  }

  function cartasCreadas() {
    const startIndex = (paginacionActual - 1) * cartasPorPagina;
    const endIndex = startIndex + cartasPorPagina;
    const currentCards = cartas.slice(startIndex, endIndex);
    $listaCartas.empty();
    currentCards.forEach(function (carta) {
      const listItem = `<li data-id="${carta._id}">${carta.nombre} <br> <img src="images/card.jpg" alt="Portada de carta"> <br> [${carta.tipo}] <br> ${carta.descripcion} <br> ${carta.puntosBatalla}</li>`;
      $listaCartas.append(listItem);
    });
    $listaCartas.find('li').click(function () {
      const cartaId = $(this).data('id');
      formularioEdicionPopup(cartaId);
    });
    mostrarPaginacion(cartas.length);
  }

  function formularioEdicionPopup(cartaId) {
    const carta = cartas.find(carta => carta._id === cartaId);
    if (!carta) {
      console.log('No se encontró la carta con el ID:', cartaId);
      return;
    }

    $('#type-card-edit').val(carta.tipo);
    $('#card-name-edit').val(carta.nombre);
    $('#edit-descripcion').val(carta.descripcion);
    $('#edit-puntosBatalla').val(carta.puntosBatalla);
    $('#edit-id').val(carta._id);

    $editFormContainer.removeClass('hidden');
  }

  function ocultarFormularioEdicionPopup() {
    $editForm[0].reset();
    $editFormContainer.addClass('hidden');
  }

  $editFormContainer.on('click', 'button.cancel', function () {
    ocultarFormularioEdicionPopup();
  });

  $formulario.submit(function (event) {
    event.preventDefault();
    const formData = $(this).serializeArray();
    const newCard = {
      tipo: formData.find(item => item.name === 'tipo').value,
      nombre: formData.find(item => item.name === 'nombre').value,
      descripcion: formData.find(item => item.name === 'descripcion').value,
      puntosBatalla: parseInt(formData.find(item => item.name === 'puntosBatalla').value),
    };
    registrarCarta(newCard);
  });

  function registrarCarta(carta) {
    $.ajax({
      url: '/cartas',
      type: 'POST',
      data: carta,
      success: function () {
        cargarCartas();
        $formulario[0].reset();
      },
      error: function (error) {
        console.log('Error al registrar la carta', error);
      }
    });
  }

  $buscador.submit(function (event) {
    event.preventDefault();
    const searchTerm = $('#search-term').val().trim();
    buscarCartas(searchTerm);
  });

  function buscarCartas(searchTerm) {
    $.ajax({
      url: '/cartas/search',
      type: 'POST',
      data: { searchTerm: searchTerm },
      success: function (cartasEncontradas) {
        cartas = cartasEncontradas;
        paginacionActual = 1;
        cartasCreadas(cartas);
      },
      error: function (error) {
        console.log('Error al buscar cartas:', error);
      }
    });
  }

  $mostrarTodas.click(function () {
    mostrarTodasLasCartas();
  });

  function mostrarTodasLasCartas() {
    $.ajax({
      url: '/cartas',
      type: 'GET',
      success: function (data) {
        cartas = data;
        paginacionActual = 1;
        cartasCreadas(cartas);
      },
      error: function (error) {
        console.log('Error al obtener la lista de cartas:', error);
      }
    });
  }

  $editForm.submit(function (event) {
    event.preventDefault();
    const formData = $(this).serializeArray();
    const editedCard = {
      tipo: formData.find(item => item.name === 'tipo').value,
      nombre: formData.find(item => item.name === 'nombre').value,
      descripcion: formData.find(item => item.name === 'descripcion').value,
      puntosBatalla: parseInt(formData.find(item => item.name === 'puntosBatalla').value),
      id: formData.find(item => item.name === 'edit-id').value,
    };
    editarCarta(editedCard);
  });

  function editarCarta(carta) {
    $.ajax({
      url: `/cartas/${carta.id}`,
      type: 'PUT',
      data: carta,
      success: function () {
        cargarCartas();
        ocultarFormularioEdicion();
      },
      error: function (error) {
        console.log('Error al editar la carta', error);
      }
    });
  }

  $('#delete-button').click(function () {
    const cartaId = $('#edit-id').val();
    eliminarCarta(cartaId);
  });

  function eliminarCarta(cartaId) {
    $.ajax({
      url: `/cartas/${cartaId}`,
      type: 'DELETE',
      success: function () {
        cargarCartas();
        ocultarFormularioEdicion();
      },
      error: function (error) {
        console.log('Error al eliminar la carta', error);
      }
    });
  }

  $pagination.on('click', 'li', function () {
    paginacionActual = $(this).data('page');
    cartasCreadas(cartas);
  });

  function mostrarPaginacion(totalCards) {
    const totalPages = Math.ceil(totalCards / cartasPorPagina);
    $pagination.empty();
    for (let i = 1; i <= totalPages; i++) {
      const listItem = `<li data-page="${i}" class="${paginacionActual === i ? 'active' : ''}">${i}</li>`;
      $pagination.append(listItem);
    }
  }
});