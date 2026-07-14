const spinnerArea = document.createElement('div')
spinnerArea.classList = "w-screen h-screen flex justify-center items-center"
spinnerArea.id = "init-spinner"
spinnerArea.innerHTML = `
    <div class="h-fit text-center flex flex-col gap-5">
        <span id="emoji" class="text-7xl animate-bounce">🙄</span>
        <h1 id="label" class="text-2xl font-bold">Идёт загрузка...</h1>
    </div>
`

function errorArea() {
    const emoji = document.querySelector("#emoji")
    const label = document.querySelector("#label")

    if (emoji && label) {
        emoji.innerHTML = '😵';
        emoji.classList.remove('animate-bounce')
        label.innerHTML = 'Ошибка загрузки данных';
    }
}

export { spinnerArea, errorArea };