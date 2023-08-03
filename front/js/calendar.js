let codes_dict = {"bah": "../assets/flags/bahrain.png", "sau": "../assets/flags/saudi.jpg", "aus": "../assets/flags/australia.png", "aze": "../assets/flags/azerbaiyan.png",
"mia": "../assets/flags/usa.png", "imo": "../assets/flags/italy.png", "mon" : "../assets/flags/monaco.png", "spa": "../assets/flags/spain.png", "can": "../assets/flags/canada.png",
"aut" : "../assets/flags/austria.png", "gbr" : "../assets/flags/gbr.png", "hun" : "../assets/flags/hungry.png", "bel": "../assets/flags/balgium.png", "ned" : "../assets/flags/ned.png",
"ita": "../assets/flags/italy.png", "sgp": "../assets/flags/singapore.png", "qat": "../assets/flags/qatar.png", "usa": "../assets/flags/usa.png", "mex" : "../assets/flags/mexico.png",
"bra": "../assets/flags/brazil.png", "veg": "../assets/flags/usa.png", "uae": "../assets/flags/uae.png"}

function reubicate(div0,div1,beforeAfter) {
    console.log(div0,div1)
    const parentDiv = document.querySelector('.main-calendar-section');
    parentDiv.removeChild(div0)

    if (beforeAfter === 'before') {
        parentDiv.insertBefore(div0,div1);

    } else if (beforeAfter === 'after') {
        parentDiv.insertBefore(div0,div1.nextSibling);

    }

}

function create_races(){
    for (let dataCode of Object.keys(codes_dict)) {
        let imageUrl = codes_dict[dataCode];
      
        let div = document.createElement('div');
        div.classList.add('race-calendar');
        div.setAttribute('data-code', dataCode);
      
        let upperDiv = document.createElement('div');
        upperDiv.classList.add('upper-race', 'bold-font');
        upperDiv.textContent = dataCode.toUpperCase();
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.classList.add('flag');
        
        upperDiv.appendChild(img);
      
        const lowerDiv = document.createElement('div');
        lowerDiv.classList.add('lower-race');

        lowerDiv.innerHTML = "<div class='form-check form-switch'><input class='form-check-input custom-toggle' type='checkbox' role='switch' id='autoContractToggle'><label class='form-check-label'>Sprint weekend</label></div><div class='form-check form-switch'><input class='form-check-input custom-toggle' type='checkbox' role='switch'><label class='form-check-label' for='flexSwitchCheckDefault'>ATA Quali</label></div>"
        div.appendChild(upperDiv);
        div.appendChild(lowerDiv);

        document.querySelector('.main-calendar-section').appendChild(div)

      
        // Aquí puedes agregar el div creado al DOM como lo desees
        // Ejemplo: document.body.appendChild(div);
      }
}

document.getElementById("confirmCalendar").addEventListener("click",function () {
    let dataCodesString = '';
    let children = document.querySelector('.main-calendar-section').children;

    Array.from(children).forEach((child) => {

        dataCodesString += child.dataset.code + ' ';

    });


    dataCodesString = dataCodesString.trim();
    console.log(dataCodesString)
    let dataCalendar = {
        command: "calendar",
        calendarCodes: dataCodesString
    }
    socket.send(JSON.stringify(dataCalendar))
})

interact('.race-calendar').draggable({
    inertia: true,
    listeners: {
        start(event) {
            let target = event.target;
            let position = target.getBoundingClientRect();
            let width = target.getBoundingClientRect().width

        },
        move(event) {
            const target = event.target;
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            target.style.transform = `translate(${x}px, ${y}px)`;
            target.style.opacity = 1;
            target.style.zIndex = 10;

            target.setAttribute('data-x',x);
            target.setAttribute('data-y',y);
        },
        end(event) {
            let target = event.target;

            const racesEvents = document.querySelectorAll('.race-calendar');
            racesEvents.forEach(function (element) {
                let eventRect = element.getBoundingClientRect();
                let centerHorizontal = (eventRect.left + eventRect.right) / 2;

                if (target !== element) {

                    if (event.clientX >= eventRect.left && event.clientX <= eventRect.right && event.clientY >= eventRect.top && event.clientY <= eventRect.bottom) {
                        console.log(element)
                        if (event.clientX >= centerHorizontal) {
                            console.log('Está en la mitad derecha del div');
                            reubicate(target,element,"after")
                        } else {
                            console.log('Está en la mitad izquierda del div');
                            reubicate(target,element,"before")
                        }

                    }
                }




            });

            target.style.transform = 'none';
            target.setAttribute('data-x',0);
            target.setAttribute('data-y',0);

            // originalParent = undefined;
            // destinationParent = undefined;
            // draggable = undefined;
        }
    }
})