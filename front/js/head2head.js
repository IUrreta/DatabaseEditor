
function manage_h2h_bars(data){
    console.log(data)
    let relValue
    document.querySelectorAll(".one-statH2H").forEach(function(elem, index){
        if(elem.id === "raceh2h" || elem.id === "qualih2h" || elem.id === "podiumsh2h" || elem.id === "dnfh2h"){
            relValue = (100 /(data[0][0] + data[0][1])).toFixed(2)
            elem.querySelector(".driver1-bar").style.width = data[index][0] * relValue + "%"
            elem.querySelector(".driver2-bar").style.width = data[index][1] * relValue + "%"

        }
        else if(elem.id === "ptsh2h" || elem.id === "bestrh2h" || elem.id === "bestqh2h"){
            relValue = 100 / Math.max(data[index][0], data[index][0])
            console.log(relValue)
            elem.querySelector(".driver1-bar").style.width = data[index][0] * relValue + "%"
            elem.querySelector(".driver2-bar").style.width = data[index][1] * relValue + "%"
        }
        elem.querySelector(".driver1-number").textContent = data[index][0]
        elem.querySelector(".driver2-number").textContent = data[index][1]
    })

}