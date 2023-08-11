
document.querySelectorAll(".bi-dash-circle").forEach(function (elem) {
    elem.addEventListener("click",function () {
        let performanceArea = elem.parentNode.parentNode
        let bar = performanceArea.querySelector(".custom-progress")
        if(bar.dataset.progress >= -9){
            let value = parseInt(bar.dataset.progress, 10) - 1
            bar.dataset.progress = value
        }
        manage_bar(bar, bar.dataset.progress)
    })
})

document.querySelectorAll(".bi-plus-circle").forEach(function (elem) {
    elem.addEventListener("click",function () {
        let performanceArea = elem.parentNode.parentNode
        let bar = performanceArea.querySelector(".custom-progress")
        if(bar.dataset.progress <= 9){
            let value = parseInt(bar.dataset.progress, 10) + 1
            bar.dataset.progress = value
        }
        manage_bar(bar, bar.dataset.progress)
    })
})

function manage_bar(bar, progress){
    let grayDiv = bar.querySelector(".gray-part")
    let greenDiv = bar.querySelector(".green-part")
    if(progress == 0){
        grayDiv.style.width = "100%"
        greenDiv.style.width = "0%"
    }
    else if(progress > 0){
        grayDiv.style.width = "100%"
        let newProgress = progress * 10
        let newWidth = 0 + newProgress + "%"
        greenDiv.style.width = newWidth;
    }
    else if(progress < 0){
        greenDiv.style.width = "0%"
        let newProgress = progress * 10
        let newWidth = 100 + newProgress + "%"
        grayDiv.style.width = newWidth;
    }
}