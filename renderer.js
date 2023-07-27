
document.addEventListener('DOMContentLoaded', function () {
    fetch("./assets/drivers.json")
      .then(response => response.json())
      .then(data => {
        const names = data.freeDrivers;
  
        const freeDriversContainer = document.getElementById('free-drivers');
  
        names.forEach(name => {
          const div = document.createElement('div');
          div.textContent = name;
          freeDriversContainer.appendChild(div);
        });
      })
      .catch(error => console.error('Error al cargar el archivo:', error));
  });
