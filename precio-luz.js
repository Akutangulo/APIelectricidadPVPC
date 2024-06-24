  // Obtener la fecha actual
 var currentDate = new Date();
 // Obtener la fecha de mañana
 var tomorrowDate = new Date();
 tomorrowDate.setDate(currentDate.getDate() + 1); 
 // Formatear las fechas en el formato necesario (YYYY-MM-DDTHH:mm) ISO 8601
 var startDate = formatDate(currentDate) + "T00:00";
 var endDate = formatDate(tomorrowDate) + "T23:59"; 
 // Construir la URL de la API con las fechas dinámicas
 var apiUrl = "https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real?start_date=" + startDate + "&end_date=" + endDate + "&time_trunc=hour";
  // Función para formatear la fecha en el formato YYYY-MM-DD
 function formatDate(date) {
   var year = date.getFullYear();
   var month = (date.getMonth() + 1).toString().padStart(2, "0");
   var day = date.getDate().toString().padStart(2, "0");
   return year + "-" + month + "-" + day;
 } 
 // Obtener el contenedor donde se mostrarán los precios
 var container = document.getElementById('electricity-container');
 var infoContainer = document.getElementById('informacion-container'); 
 // Obtener los datos de la API
 fetch(apiUrl)
   .then(response => response.json())
   .then(data => {
     // Obtener los datos de los precios de electricidad
     var pricesData = data.included.find(item => item.type === 'PVPC (\u20ac/MWh)').attributes.values;
 
     // Obtener la hora actual
     var currentHour = new Date().getHours();
 
     // Recorrer los datos y agregar divs al contenedor
     pricesData.forEach(function(item, index) {
       var datetime = new Date(item.datetime);
       var price = item.value.toFixed(2);
       var div = document.createElement('div');
 
       // Agregar las clases correspondientes según las condiciones
       if (index === currentHour) {
         div.classList.add('precioActual');
       } else if (price === getLowestPrice(pricesData)) {
         div.classList.add('mejorPrecio');
       } else if (price === getHighestPrice(pricesData)) {
         div.classList.add('peorPrecio');
       } else if (datetime < new Date()) {
         div.classList.add('precioPasado');
       }
 
       // Crear elementos span para mostrar la hora y el precio
       var timeSpan = document.createElement('span');
       if (index === currentHour) {
         var clockSpan = document.createElement('span');
         clockSpan.id = 'clock';
         timeSpan.appendChild(clockSpan);
       } else {
         timeSpan.innerHTML  = getCurrentTime(datetime);
       }
       
       var priceSpan = document.createElement('span');
       priceSpan.innerHTML = (price / 1000).toFixed(3) + ' € por Kilovatio';
       
       // Agregar los elementos span al div y el div al contenedor
       div.appendChild(timeSpan);
       div.appendChild(document.createElement('br'));
       div.appendChild(priceSpan);
       container.appendChild(div);
     });
 
     // Calcular el precio promedio del día
     var averagePrice = calculateAveragePrice(pricesData);
     var formattedDateString = getFormattedDateString(currentDate);
 
     // Crear el div de información diaria
     var infoDiv = document.createElement('div');
     infoDiv.classList.add('informacionDiaria');
     infoDiv.innerHTML = `El precio medio de la luz hoy ${formattedDateString} es ${averagePrice.toFixed(2)} €`;
 
     // Obtener el precio más caro y su hora correspondiente
     var highestPrice = getHighestPrice(pricesData);
     var highestPriceTime = getTimeForPrice(pricesData, highestPrice);
     var highestPriceSpan = document.createElement('span');
     highestPriceSpan.classList.add('precioLuz');
     highestPriceSpan.innerHTML = `${highestPriceTime} Precio más caro: ${highestPrice} €`;
 
     // Obtener el precio más barato y su hora correspondiente
     var lowestPrice = getLowestPrice(pricesData);
     var lowestPriceTime = getTimeForPrice(pricesData, lowestPrice);
     var lowestPriceSpan = document.createElement('span');
     lowestPriceSpan.classList.add('precioLuz');
     lowestPriceSpan.innerHTML = `${lowestPriceTime} Precio más barato: ${lowestPrice} €`;
 
     // Agregar los spans al div de información diaria
     infoDiv.appendChild(highestPriceSpan);
     infoDiv.appendChild(lowestPriceSpan);
 
     // Agregar el div de información diaria al contenedor
     infoContainer.appendChild(infoDiv);
 
     // Actualizar el reloj cada segundo
     setInterval(updateClock, 1000);
   })
   .catch(error => console.log('Error:', error));
 
 // Función para obtener la hora actual en formato HH:00
 function getCurrentTime(date) {
   var formattedHours = date.getHours().toString().padStart(2, '0');
   return `${formattedHours}:00`;
 }
 
 // Función para actualizar el reloj cada segundo
 function updateClock() {
   var clockElement = document.getElementById('clock');
   if (clockElement) {
     var currentTime = new Date();
     var formattedTime = currentTime.getHours().toString().padStart(2, '0') + ':' +
                         currentTime.getMinutes().toString().padStart(2, '0') + ':' +
                         currentTime.getSeconds().toString().padStart(2, '0');
     clockElement.textContent = formattedTime;
   }
 }
 
 // Función para obtener el precio más bajo
 function getLowestPrice(pricesData) {
   var lowestPrice = Number.MAX_VALUE;
   pricesData.forEach(function(item) {
     var price = item.value;
     if (price < lowestPrice) {
       lowestPrice = price;
     }
   });
   return lowestPrice.toFixed(2);
 }
 
 // Función para obtener el precio más alto
 function getHighestPrice(pricesData) {
   var highestPrice = Number.MIN_VALUE;
   pricesData.forEach(function(item) {
     var price = item.value;
     if (price > highestPrice) {
       highestPrice = price;
     }
   });
   return highestPrice.toFixed(2);
 }
 
 // Función para calcular el precio promedio
 function calculateAveragePrice(pricesData) {
   var sum = 0;
   pricesData.forEach(function(item) {
     var price = item.value;
     sum += price;
   });
   var average = sum / pricesData.length;
   return average;
 }
 
 // Función para obtener la fecha en formato "Domingo 18 de Junio"
 function getFormattedDateString(date) {
   var days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
   var months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
   var formattedDay = days[date.getDay()];
   var formattedDate = date.getDate();
   var formattedMonth = months[date.getMonth()];
   return `${formattedDay} ${formattedDate} de ${formattedMonth}`;
 }
 
 // Función para obtener la hora correspondiente a un precio
 function getTimeForPrice(pricesData, price) {
   var priceItem = pricesData.find(function(item) {
     return item.value.toFixed(2) === price;
   });
   var datetime = new Date(priceItem.datetime);
   return getCurrentTime(datetime);
 }
