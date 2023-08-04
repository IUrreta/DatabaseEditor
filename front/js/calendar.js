let codes_dict = {
    "bah0": "../assets/flags/bahrain.png","sau0": "../assets/flags/saudi.jpg","aus0": "../assets/flags/australia.png","aze0": "../assets/flags/azerbaiyan.png",
    "mia0": "../assets/flags/usa.png","imo0": "../assets/flags/italy.png","mon0": "../assets/flags/monaco.png","spa0": "../assets/flags/spain.png","can0": "../assets/flags/canada.png",
    "aut0": "../assets/flags/austria.png","gbr0": "../assets/flags/gbr.png","hun0": "../assets/flags/hungry.png","bel0": "../assets/flags/balgium.png","ned0": "../assets/flags/ned.png",
    "ita0": "../assets/flags/italy.png","sgp0": "../assets/flags/singapore.png","qat0": "../assets/flags/qatar.png","usa0": "../assets/flags/usa.png","mex0": "../assets/flags/mexico.png",
    "bra0": "../assets/flags/brazil.png","veg0": "../assets/flags/usa.png","uae0": "../assets/flags/uae.png"
}
let countries_dict = {
    "bah0": "Bahrain", "sau0": "Saudi Arabia", "aus0": "Australia", "aze0": "Azerbaijan",
    "mia0": "Miami", "imo0": "Imola", "mon0": "Monaco", "spa0": "Spain", "can0": "Canada",
    "aut0": "Austria", "gbr0": "United Kingdom", "hun0": "Hungary", "bel0": "Belgium", "ned0": "Netherlands",
    "ita0": "Italy", "sgp0": "Singapore", "qat0": "Qatar", "usa0": "USA", "mex0": "Mexico",
    "bra0": "Brazil", "veg0": "Vegas", "uae0": "Abu Dhbai"
};

let deleting = false;

function reubicate(div0,div1,beforeAfter) {
    const parentDiv = document.querySelector('.main-calendar-section');
    parentDiv.removeChild(div0)

    if (beforeAfter === 'before') {
        parentDiv.insertBefore(div0,div1);

    } else if (beforeAfter === 'after') {
        parentDiv.insertBefore(div0,div1.nextSibling);

    }

}

function addRace(code){
    let imageUrl = codes_dict[code];

        let div = document.createElement('div');
        div.classList.add('race-calendar');
        div.setAttribute('data-code',code);

        let upperDiv = document.createElement('div');
        upperDiv.classList.add('upper-race','bold-font');
        upperDiv.textContent = code.slice(0, -1).toUpperCase();

        const img = document.createElement('img');
        img.src = imageUrl;
        img.classList.add('flag');

        upperDiv.appendChild(img);

        const lowerDiv = document.createElement('div');
        lowerDiv.classList.add('lower-race');

        lowerDiv.innerHTML = "<div class='form-check form-switch'><input class='form-check-input custom-toggle sprint-input' type='checkbox' role='switch''><label class='form-check-label'>Sprint weekend</label></div><div class='form-check form-switch'><input class='form-check-input custom-toggle ata-input' type='checkbox' role='switch'><label class='form-check-label' for='flexSwitchCheckDefault'>ATA Quali</label></div>";
        let SprintInput = lowerDiv.querySelector(".sprint-input")
        let ATAInput = lowerDiv.querySelector(".ata-input")
        SprintInput.addEventListener("click", function(event){
            if (ATAInput.checked) ATAInput.checked = false
            if(SprintInput.checked) changeFormat(div, "1")
            else changeFormat(div, "0")

        })
        ATAInput.addEventListener("click", function(event){
            if (SprintInput.checked) SprintInput.checked = false
            if(ATAInput.checked) changeFormat(div, "2")
            else changeFormat(div, "0")

        })
        div.appendChild(upperDiv);
        div.appendChild(lowerDiv);

        document.querySelector('.main-calendar-section').appendChild(div)



}

function create_races() {
    document.querySelector('.main-calendar-section').innerHTML = ""
    for (let dataCode of Object.keys(codes_dict)) {
        addRace(dataCode)

    }
    load_addRaces()
}

function changeFormat(div, format){
    let lastChar = div.dataset.code.charAt(div.dataset.code.length - 1)
    if(/\d/.test(lastChar)){
        div.dataset.code = div.dataset.code.slice(0, -1) + format
    }
    else{
        div.dataset.code = div.dataset.code + format
    }
    
}

function load_addRaces(){
    for (let dataCode of Object.keys(codes_dict)) {
        let elem = countries_dict[dataCode]
        let li = document.createElement('li');
        let a = document.createElement('a');
        a.classList.add('dropdown-item');
        a.classList.add('menu-race');
        a.href = '#';
        a.textContent = elem;
        a.dataset.code = dataCode

        let imageUrl = codes_dict[dataCode];
        let img = document.createElement('img');
        img.src = imageUrl;
        img.classList.add('menuFlag');

        a.appendChild(img)

        li.appendChild(a);
        document.getElementById("addTrackMenu").appendChild(li);

    }
    listenerRaces()
}

function listenerRaces(){
    document.querySelectorAll('#addTrackMenu a').forEach(item => {
        item.addEventListener("click", function(){
            if(document.querySelector(".main-calendar-section").childElementCount < 22){
                addRace(item.dataset.code)
            }
        })
    })
}

document.getElementById("deleteTracks").addEventListener("click", function(btn){
    if(deleting){
        document.querySelectorAll(".delete-div").forEach(function(elem){
            elem.parentNode.removeChild(elem)
        })
        this.className = "btn custom-delete option-buttons"
        document.querySelectorAll(".race-calendar").forEach(function(elem){
            elem.classList = "race-calendar";

        })

    }
    else{
        document.querySelectorAll(".race-calendar").forEach(function(elem){
            elem.classList = "race-calendar deleting";
            let div = document.createElement('div');
            div.classList.add('delete-div');
            let divText = document.createElement('div');
            divText.innerHTML = "Delete";
            divText.className = "bold-font"
            divText.style.fontSize = "18px"
            div.appendChild(divText);
            elem.insertBefore(div, elem.firstChild);
            divText.addEventListener("click", function(){
                let race = divText.parentNode.parentNode
                divText.parentNode.parentNode.parentNode.removeChild(race)
            })

        })
        this.className = "btn custom-delete option-buttons delete-mode"

    }

    deleting = !deleting
})



document.getElementById("confirmCalendar").addEventListener("click",function () {
    let dataCodesString = '';
    let children = document.querySelector('.main-calendar-section').children;

    Array.from(children).forEach((child) => {

        dataCodesString += child.dataset.code + ' ';

    });


    dataCodesString = dataCodesString.trim();
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
                        if (event.clientX >= centerHorizontal) {
                            reubicate(target,element,"after")
                        } else {
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