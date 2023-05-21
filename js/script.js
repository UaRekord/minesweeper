let size = 6; //размер игрового поля ширина и высота
const board = document.querySelector('.board');
const footer = document.querySelector('.footer');
const selector = document.querySelector('.selector');
const tileSize = 50; //размер клетки
const colorDigits = ['blue', 'green', 'red', 'darkblue', 'brown', 'rose']; // цвета количества бомб
const startButton = document.querySelector('.new-game-btn');
let boardSize = 0;
let tilesArray = [];
let bombsPlaces = []; //места бомб
let bombPercent = 15; //количество бомб в процентах от количества клеток
let bombsAround = []; //количество бомб вокруг
let numsAround = {}; //объект для координат клеток вокруг бомб

function createGameField() {
	let x = 0;
	let y = 0; // генерация клеток
	if (selector.selectedIndex === 1) {
		size = 8;
	} else if (selector.selectedIndex === 2) {
		size = 10;
	} else {
		size = 6;
	}
	for (let i = 0; i < Math.pow(size, 2); i++) {
		const tile = document.createElement('div');
		tile.classList.add('tile');
		tilesArray.push(tile);
		boardSize = Math.sqrt(tilesArray.length);
		board.style.width = boardSize * tileSize + 'px';
	} // присвоение координат через дата-атрибут
	tilesArray.forEach(element => {
		element.setAttribute('data-coordinate', `${x},${y}`);
		bombGenerator(x,y);
		x++;
		if (x >= boardSize) {
			x = 0;
			y++;
		}
	}); // количество бомб вокруг клетки кладется в атрибут data-number
	tilesArray.forEach(element => {
		let numTile = numsAround[element.getAttribute('data-coordinate')];
		if (numTile && !bombsPlaces.includes(numTile)) {
			element.setAttribute('data-number', numTile);
		}
	});
	// вставка игрового поля в DOM
  board.append(...tilesArray);
}

function bombGenerator(x,y) {
	let bombFactor = Math.random() < bombPercent/100;
	if (bombFactor) { // минирование
		bombsPlaces.push(`${x},${y}`);
		// вычисление клеток вокруг бомб и добавление их в массив
		if (x > 0) bombsAround.push(`${x-1},${y}`);
		if (x < boardSize - 1) bombsAround.push(`${x+1},${y}`);
		if (y > 0) bombsAround.push(`${x},${y-1}`);
		if (y < boardSize - 1) bombsAround.push(`${x},${y+1}`);
		if (x > 0 && y > 0) bombsAround.push(`${x-1},${y-1}`);
		if (x < boardSize - 1 && y < boardSize - 1) bombsAround.push(`${x+1},${y+1}`);
		if (y > 0 && x < boardSize - 1) bombsAround.push(`${x+1},${y-1}`);
		if (x > 0 && y < boardSize - 1) bombsAround.push(`${x-1},${y+1}`);
	} //генерация объекта, в котором ключ - координата клетки,
	  // а значение количество бомб в ближайших клетках вокруг
	numsAround = bombsAround.reduce((coordinate, number) => {
	  coordinate[number] = (coordinate[number] || 0) + 1 ;
	  return coordinate;
	}, {});
}

// если клик по клетке с бомбой
function finishGame() {
	footer.classList.add('show');
	tilesArray.forEach(tile => {
		let coordinate = tile.getAttribute('data-coordinate');
		if (bombsPlaces.includes(coordinate)) {
			tile.classList.add('tile-check', 'tile-bomb');
			tile.innerHTML = ' 💣 ';
		} else {
			tile.classList.add('tile-check');
		}
	});
	let audio = new Audio();
	audio.preload = 'auto';
	audio.src = 'assets/audio/vzryiv.mp3';
	audio.play();
}

function checkTile(event) {
	let tile = event.target;
  if (tile.classList.value == 'tile') {
		if (bombsPlaces.includes(tile.getAttribute('data-coordinate'))) {
			finishGame();
		} else if (bombsAround.includes(tile.getAttribute('data-coordinate'))) {
			tile.innerHTML = tile.getAttribute('data-number');
			tile.classList.add('tile-check');
			tile.style.color = colorDigits[tile.getAttribute('data-number')];
		} else {
			tile.classList.add('tile-check');
		}
 }
}

function clearBoard() {
	board.innerText = '';
	boardSize = 0;
	tilesArray = [];
	bombsPlaces = [];
  bombsAround = [];
  numsAround = {};
}

function restart() {
	clearBoard();
	footer.classList.remove('show');
	createGameField();
	board.addEventListener('click', checkTile);
	board.addEventListener('contextmenu', addFlag);
	console.log(bombsPlaces);
}

function addFlag(event) {
	event.preventDefault();
	let tile = event.target.classList;
  if (tile.value.includes('tile') && !tile.value.includes('tile-check')) {
			tile.toggle('tile-flag');
		}
	if (Array.from(tile).includes('tile-flag')) {
			event.target.innerHTML = '&#128681';
	} else if (!tile.value.includes('tile-check')) {
		event.target.innerHTML = '';
	}
}

startButton.addEventListener('click', restart)
