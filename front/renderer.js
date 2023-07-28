
document.addEventListener('DOMContentLoaded', function () {

    const socket = new WebSocket('ws://localhost:8765/');

    const myModal = new bootstrap.Modal(document.getElementById('exampleModal'));
    const raceBonusCheck = document.getElementById("raceBonusCheck");
    const raceBonusAmt = document.getElementById("raceBonusAmt");
    const raceBonusPos = document.getElementById("raceBonusPos");
    let originalParent;
    let destinationParent;
    let draggable;

    fetch("../assets/drivers.json")
        .then(response => response.json())
        .then(data => {
            const names = data.freeDrivers;

            const freeDriversContainer = document.getElementById('free-drivers');

            names.forEach(name => {
                if (name.trim() !== '') {
                    const div = document.createElement('div');
                    div.textContent = name.trim();
                    div.classList.add('free-driver'); // Agrega la clase "free-driver"
                    freeDriversContainer.appendChild(div);
                }
            });
        })
        .catch(error => console.error('Error al cargar el archivo:', error));

    socket.onopen = () => {
        console.log('Conexión establecida.');
        let data = {
            command: "connect"
        }
        socket.send(JSON.stringify(data))
    };

    raceBonusCheck.addEventListener("click", function () {
        if (raceBonusCheck.checked) {
            raceBonusPos.disabled = false;
            raceBonusAmt.disabled = false;
        }
        else {
            raceBonusPos.disabled = true;
            raceBonusAmt.disabled = true;
        }
    })

    document.getElementById("confirmButton").addEventListener('click', function () {
        let salaryData = document.getElementById("salaryInput").value;
        let yearData = document.getElementById("yearInput").value;
        let signBonusData = document.getElementById("signBonusInput").value;
        console.log(document.getElementById("yearInput"))
        let data = {
            command: "hire",
            driver: draggable.innerHTML,
            salary: salaryData,
            year: yearData,
            signBonus: signBonusData
        }
        destinationParent.appendChild(draggable);
        socket.send(JSON.stringify(data))
    })

    document.getElementById("cancelButton").addEventListener('click', function () {
        // Volver a colocar div0 como hijo de su div padre original
        originalParent.appendChild(draggable);

        // Restablecer la posición original
        div0.style.transform = 'translate(0px, 0px)';
        div0.setAttribute('data-x', 0);
        div0.setAttribute('data-y', 0);


    })

    interact('.free-driver').draggable({
        inertia: true,
        listeners: {
            start(event) {
                originalParent = event.target.parentNode;
                draggable = event.target;
            },
            move(event) {
                const target = event.target;
                const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                target.style.transform = `translate(${x}px, ${y}px)`;

                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            },
            end(event) {
                const target = event.target;
                const freeDrivers = document.getElementById('free-drivers');
                const freeRect = freeDrivers.getBoundingClientRect();

                const driverSpaceElements = document.querySelectorAll('.driver-space');
                driverSpaceElements.forEach(function (element) {
                    const rect = element.getBoundingClientRect();
                    if (event.clientX >= rect.left && event.clientX <= rect.right &&
                        event.clientY >= rect.top && event.clientY <= rect.bottom) {
                        if (element.childElementCount < 1) {
                            destinationParent = element;
                            element.appendChild(target);
                            console.log(target.innerHTML)
                            console.log(element.parentNode.dataset.team)
                            document.getElementById("contractModalTitle").innerHTML = target.innerHTML + "'s contract with " + element.parentNode.dataset.team;
                            myModal.show();
                        }
                    }
                });


                const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                // Verifica si el punto final del evento de soltar está dentro de los límites del div "contracted-drivers"


                // Verifica si el punto final del evento de soltar está dentro de los límites del div "free-drivers"
                if (event.clientX >= freeRect.left && event.clientX <= freeRect.right &&
                    event.clientY >= freeRect.top && event.clientY <= freeRect.bottom) {
                    // Suelta el div en el div "free-drivers"
                    freeDrivers.appendChild(target);
                    let data = {
                        command: "fire",
                        driver: draggable.innerHTML
                    }
                    socket.send(JSON.stringify(data))
                }

                // Reinicia las coordenadas de arrastre
                target.style.transform = 'none';
                target.setAttribute('data-x', 0);
                target.setAttribute('data-y', 0);
                // originalParent = undefined;
                // destinationParent = undefined;
                // draggable = undefined;
            }
        }
    });
});
