newGame()
let x = 0, y = 0
document.onkeydown = checkKey;

const timer = document.querySelector('.count')
timer.textContent = 30

const score = document.querySelector('.score')
score.textContent = 'Score: 0'
let scoreReal = 0

//timer
var timeleft = 30
var download = setInterval(function() {
  if (!timeleft) {
    clearInterval(download)
    console.log('its over');
    blockAccess()
    alert('Congrats! You got ' + scoreReal + ' points')
  }
  timer.textContent = timeleft
  --timeleft
}, 1000)

//stop pressing
function blockAccess() {
  document.onkeydown = function (e) {
    return false;
  }
}

//pressing keys
function checkKey(e) {
  //only arrow keys
  if (e.keyCode != '37' && e.keyCode != '38' && e.keyCode != '39' && e.keyCode != '40') return

  //selecting it
  const prevCell = document.querySelector('.board').getElementsByTagName('section')[x].children[y]

  //keys
  if (e.keyCode == '38') {
      // up arrow: a[1][1] -> a[0][1]
      --x
      if (x == -1) {
        ++x
        return
      }
  }
  else if (e.keyCode == '40') {
    // down arrow: a[1][1] -> a[2][1]
      ++x
      if (x == 3) {
        --x
        return
      }
    }
    else if (e.keyCode == '37') {
    // left arrow: a[1][1] -> a[1][0]
    --y
    if (y == -1) {
      ++y
      return
    }
  }
  else if (e.keyCode == '39') {
    // right arrow: a[1][1] -> a[1][2]
    ++y
    if (y == 3) {
      --y
      return
    }
  }

  //change the tiles
  const currCell = document.querySelector('.board').getElementsByTagName('section')[x].children[y]
  prevCell.classList.remove('some')
  currCell.classList.add('some')
  currCell.classList.toggle('color')

  //end turn
  let total = 0
  for (let i = 0; i < 3; ++i) {
    for (let j = 0; j < 3; ++j) {
      const cell = document.querySelector('.board').getElementsByTagName('section')[i].children[j]
      if (cell.classList.contains('color')) ++total
    }
  }
  if (total == 9) {
    scoreReal += 100
    score.textContent = 'Score: ' + scoreReal
    clearBoard()
    newGame()
  }
}

function clearBoard() {
  for (let i = 0; i < 3; ++i) {
    for (let j = 0; j < 3; ++j) {
      const cell = document.querySelector('.board').getElementsByTagName('section')[i].children[j]
      cell.classList.remove('color')
    }
  }
}

function newGame() {
  for (let i = 0; i < 3; ++i) {
    for (let j = 0; j < 3; ++j) {
      let oneOrZero = (Math.random()>=0.5)? 1 : 0
      const cell = document.querySelector('.board').getElementsByTagName('section')[i].children[j]
      if (oneOrZero) cell.classList.add('color')
    }
  }
}

/*
Improvements:
- better design lol (+ animations kek)
- add the '3, 2, 1, Go'
- better ending + restart
- fix the all lights on bug
- add multiple options like 4x4
- add homescreen where you can choose the style (2x2 or 4x4, choose the time)
- see highscores for each
- fix window production designs (when small browser, phone view)
*/