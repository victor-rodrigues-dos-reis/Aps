renderAllCards();

function addEventClickToCloseButton() {
    console.log('vwevw');
    $(".close-card").on('click', (event) => {
        const button = $(event.currentTarget);
        
        console.log(button.closest('.air-card'));
        localStorage.removeItem(String(button.val()));
        button.closest('.air-card').remove();
    });
}


$("#add-location").on("submit", async (event) => {
    event.preventDefault();
    
    const arrayCitiesSearched = Object.keys({ ...localStorage });
    const search = $("#search").val();
    
    try {
        $("#add-location").trigger("reset");
        const apiData = await getApiData(search);

        console.log(arrayCitiesSearched, apiData.data.idx);
        if (arrayCitiesSearched.includes(String(apiData.data.idx))) {
            showToastAlert('Cidade já está salva', 'warning');
            return;
        }
        renderCard(apiData.data);
        
        localStorage.setItem(apiData.data.idx, JSON.stringify(apiData.data));
        
    } catch (error) {
        showToastAlert(error, 'error');
    }
});


function renderAllCards() {
    const items = { ...localStorage };
    for (const index in items) {
        renderCard(JSON.parse(items[index]));
    }
}

async function getApiData(location) {
    const response = await fetch('https://api.waqi.info/feed/'+location+'/?token=7daabd1c8c5d7a8e581d710e660960c1f1d52fd9')
    .catch(error => {
        throw new Error('Erro a buscar informações');
    });

    const responseJson = await response.json();

    console.log(responseJson);

    if (responseJson['status'] == 'error') {
        throw new Error('Cidade não consta na base de dados');
    }

    return responseJson;
}

function renderCard(data) {
    var template = document.getElementById('air-card').innerHTML;
    var compiledTemplate = Handlebars.compile(template);

    const country = data.city.name.split(', ').pop();
    const city = data.city.name.split(', ')[0];

    var rendered = compiledTemplate({
        city: city,
        country: country, 
        quality: data.aqi,
        idx: data.idx,
        o3: data.forecast.daily.o3[2].avg,
        pm10: data.forecast.daily.pm10[2].avg,
        pm25: data.forecast.daily.pm25[2].avg
    });

    document.getElementById('cards-container').innerHTML += rendered;
    addEventClickToCloseButton();
}

function showToastAlert(message, icon='success') {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })
      
      Toast.fire({
        icon: icon,
        title: message
      })
}