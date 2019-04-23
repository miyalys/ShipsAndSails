
// TODO: Programatically insert all ships from the array, rather than adding them manually in HTML and binding to them here
// Ships need an ID as Java needs to be able to refer to it uniquely, and it cannot do so based off orientation or position as several ships of the same type may occupy the same space (after a collision).
class Ship {
  constructor(el, id, x, y, orientation, type, nationality) {
    this.el = el
    this.id = id
    this.x = x
    this.y = y
    this.type = type

    this.orientation = orientation // Scenario determined: x, y, type, orientation, nationality. More?
    this.nationality = nationality

    // Stats
    
    // Hardcoded rather than passed in by the constructor?
    this.sailors     = 100  // In Java this should simply be derived off ship type. Unlike Java it's a percentage here, since it's represented by a progress bar. That could be changed if need be, and then the value must simply be converted to percent for that progress bar.
    this.hull_health = 100
    this.sail_health = 100
    this.currentAmmunitionType = 0
    this.load = 0
    this.speed = 0 // The current speed of the ship

    // TODO: Add turns and moves max as well as the number currently made here? Really such values, and many others, should be passed by and thus set by Java.
  }
}

// Type stats:
// max speed, max sail, number_of_sailors_per_sail

class Tile {
  constructor(el, x, y) {
    this.el = el
    this.x = x // These are coordinates, not pixel positions.
    this.y = y
  }
}

// Just a few test ships
// This is supposed to be what the ships look like when we receive them from Java. The element reference is missing at this point as it's generated in JS, say in place_ships.
const ship1 = new Ship( null, 1, 1, 5, 30, "ship-of-the-line", "Aztec")
const ship2 = new Ship( null, 2, 1, 3, 30, "brig", "Aztec" )
const ship3 = new Ship( null, 3, 3, 4, 330, "man-at-war", "Aztec" )
const ship4 = new Ship( null, 5, 1, 7, 330, "man-at-war", "Celts" ) // The enemy!

ships = [ship1, ship2, ship3, ship4]

// TODO: Hardcoded which nationality the player is for now, just for testing
player = "Aztec"
enemy = "Celts"



/* SETTINGS */

// Music

/* Auto-start background music */

// const audio = new Audio('audio/music/5.opus')
const audio = new Audio('audio/music/7.opus')
// audio.play() // Auto-play music
var sfx_muted = false
var sfx_volume = 0.6

/* Tiles / World settings */

const width = 6                   // It makes 1 less than twice the amount of this, if not zero indexed
const height = 5                  // 1 lower than the total number of tiles from top to bottom, if not zero indexed
const t_width = width * 2 - 2     // Total width and heights, starting from 0

/* Ship settings */

ship_move_distance = 90

// Orientation settings. Interval: 60, resulting in 6 different directions. Hexagons! */
o_offset = 30 // Depends on the sprite, determining its origin from which it should be rotated. Fx. if facing straight left it needs to be turned say 30 degrees up or down. Could opt for always rotating clockwise to the nearest valid orientation.
o_degrees = 60


// The relative offset based off the orientation_offset. If changing to tip topped hexagons, just change the offset!
// TODO: Actually not used for anything at the moment?
orientations = [o_offset, o_offset + (o_degrees*1), o_offset + (o_degrees*2), o_offset + (o_degrees*3), o_offset + (o_degrees*4), o_offset + (o_degrees*5)]


/* SFX settings */

const base_path               = 'audio/sfx/'
const base_path_brig          = 'audio/sfx/brig/'
const base_path_sotl          = 'audio/sfx/ship-of-the-line/'
const base_path_maw           = 'audio/sfx/man-at-war/'

const brig_sounds_ready       = ['Kuwhat1.wav', 'Kuwhat2.wav', 'Kuwhat3.wav']
const brig_sounds_affirmative = ['Kuyessr1.wav', 'Kuyessr2.wav', 'Kuyessr3.wav']
const sotl_sounds_ready       = ['Hshpredy.wav', 'Hshpwht1.wav', 'Hshpwht2.wav', 'Hshpwht3.wav']
const sotl_sounds_affirmative = ['Hshpyes1.wav', 'Hshpyes2.wav', 'Hshpyes3.wav']
const maw_sounds_ready       = ['Alwhat1.wav', 'Alwhat2.wav', 'Alwhat3.wav']
const maw_sounds_affirmative = ['Alyessr1.wav', 'Alyessr2.wav', 'Alyessr3.wav']

const sounds_sink             = ['ship-sinking.wav']
const sounds_edge             = ['edge-scream.wav']



/* INIT */

// Default selected ship is no ship. Defined out here to have the proper scope.
ship = null
tiles = [] // No tiles to begin with, populated by place_tiles

place_tiles()
place_ships()



/* METHODS */

function place_tiles() {
  let tilesHTML = document.getElementById('tiles') // Get a reference to what will be the element surrounding all the tiles
  const tile_offset_height = 121 // Pretty much = the height of the tile
  const tile_offset_width = 210  // Pretty much = the width of the tile

  // Add the odd columns of tiles
  for (var w = 0; w < width; w++) {

    for (var h = 0; h < height+1; h++) {
      
      let div = document.createElement('div')
      div.classList.add('basic-tile')  // Add basic-tile class to the element
      tilesHTML.appendChild(div)       // Add HTML element to the page
      tiles.push( new Tile(div, h, w*2) ) // Add tile to the tile array: 0,0 - 0,2 - 0,4
      div.style.top  += (h * tile_offset_height) + "px"
      div.style.left += (w * tile_offset_width)  + "px"
      // place_tile_coordinates((h * tile_offset_height), (w * tile_offset_width), h, w*2)
    }
  }


  // Add the even columns of tiles (done independently since they're offset from each other)
  for (var w = 0; w < (width-1); w++) {

    for (var h = 0; h < (height+1); h++) {
      
      let div = document.createElement('div')
      div.classList.add('basic-tile')

      // Calculating offsets for the first two tiles, which the rest will be positioned based on
      new_h = Math.floor(tile_offset_height / 2) * -1 // Negative to move the tile upwards by half the tile height
      new_w = Math.floor(tile_offset_width / 2)

      tilesHTML.appendChild(div)
      tiles.push( new Tile(div, h, (w+1)*2-1) ) // Add tile to the tile array: 0,1 - 0,3 - 0,5
      
      div.style.top  += new_h + (h * tile_offset_height) + "px"
      div.style.left += new_w + (w * tile_offset_width)  + "px"
      // place_tile_coordinates(new_h + (h * tile_offset_height), new_w + (w * tile_offset_width), h, (w+1)*2-1)
    }
  }
}

// Maybe just for debugging, doesn't quite position the numbers correctly, but it's almost good enough for debug
function place_tile_coordinates(tile_h, tile_w, x, y) {
  let tilesHTML = document.getElementById('tiles') // Get a reference to what will be the element surrounding all the tiles
  let div = document.createElement('div')
  div.innerHTML = x + ", " + y
  div.classList.add('tile-coordinate')
  tilesHTML.appendChild(div)

  let cb = document.getElementById("tiles").getBoundingClientRect();
  div.style.top  = (tile_h - cb.top) + "px"
  div.style.left = (tile_w - cb.left) + "px"
}

// For setting up the match
function place_ships() {
  let shipsHTML = document.getElementById('ships')
  for (aShip of ships) {
    let div = document.createElement('div')
    div.classList.add('ship')       // Adding the styling all ships have in common
    div.classList.add(aShip.type)   // I need to add a class so CSS knows which ship model it for selecting an image to show
    shipsHTML.appendChild(div)
    aShip.el = div // A reference to this particular ship is saved. TODO: Is this even possible?

    // Rotate the ship properly 
    aShip.el.style.transform = "rotate(+" + aShip.orientation + "deg)"; // TODO: The default rotation may vary per ship? Randomize it based off the orientations array? Basically this should be default_rotation + aShip.orientation

    // Put the ship in its proper position on the map
    for (aTile of tiles) {
      if (aTile.x == aShip.x && aTile.y == aShip.y) {
        let cb = document.getElementById("tiles").getBoundingClientRect();
        let coords = aTile.el.getBoundingClientRect();
        // aShip.el.style.left = aTile.el.style.left
        // aShip.el.style.top  = aTile.el.style.top
        aShip.el.style.left = (coords.left - cb.left + 35) + "px" // 40 was adjusted manually to move the ship from the edge of the tile to the center
        aShip.el.style.top  = (coords.top - cb.top + 20) + "px"
        break
      }
    }
  }
}


function play_sfx_ready() {
  if (ship.type == 'brig') play_sfx(base_path_brig, brig_sounds_ready)
  else if (ship.type == 'ship-of-the-line') play_sfx(base_path_sotl, sotl_sounds_ready)
  else if (ship.type == 'man-at-war') play_sfx(base_path_maw, maw_sounds_ready)
}

function play_sfx_affirmative() {
  if (ship.type == 'brig') play_sfx(base_path_brig, brig_sounds_affirmative)
  else if (ship.type == 'ship-of-the-line') play_sfx(base_path_sotl, sotl_sounds_affirmative)
  else if (ship.type == 'man-at-war') play_sfx(base_path_maw, maw_sounds_affirmative)
}

function play_sfx(bp, sounds) {

  if (!sfx_muted) {

    sfx = new Audio(bp + sounds[ Math.floor(Math.random()*sounds.length) ])
    sfx.volume = sfx_volume
    sfx.play()
  }
}

// Try to mute all video and audio elements on the page
function sfx_toggle() {
  sfx_muted = !sfx_muted
}

/* Main game buttons */

function music_toggle() {
  if (audio.paused) audio.play()
  else audio.pause()
}

  
// TODO: Prevent ending the turn if there's moves you have to make left, due to speed
function end_turn() {
  alert('Ending turn...')
  if (ship.load != 0) ship.load--
  display_current_ammunition() // The ammunition might be loaded now, so the UI should show it
}


// Adding an event listener on the Ships div, used for ship selection below 
document.getElementById('ships').addEventListener('click', function(event) {
  ship_selection(event.target);
})

// TODO: Ideally this border should not rotate with the ship. Tried adding a surrounding div and putting a border on that but it was somewhere else (so i guess it would have to be moved as well, just not rotated?)
// Also call functions for updating the turn/move buttons based off remaining moves/turns (request the info from Java)
function ship_selection(clicked_ship) {
  // Now we have the ship element. Find the related ship object:
  for (aShip of ships) {
    // Only allow the user to select the ships of their own nationality
    if (aShip.el == clicked_ship && aShip.nationality == player) { 
      ship = aShip
      aShip.el.classList.add('ship-selected')

      /* Update health bars */
      document.getElementById('sailors').style.width = ship.sailors + "%"
      document.getElementById('hull-health').style.width = ship.hull_health + "%"
      document.getElementById('sails-health').style.width = ship.sail_health + "%"

      display_current_ammunition() // Update the UI to show the currently loaded ammunition for the current ship

      play_sfx_ready()
    }
    else {
      aShip.el.classList.remove('ship-selected') // Remove selected from all other ships
    }
  }
}


/* Ship controls */

function move() {
    even = (ship.y % 2)? true : false

  // 30, 90, 150, 210, 270, 330

  // if (on any border and facing the border):
  // Over the edge checks
  // If at the top or bottom of the map and facing one of those two directions respectively: Over the edge.
  // For left and right there are 4 directions to check
  // Moving within the board
    // Updating coordinates
    if (ship.orientation == 30) {
      if (even) ship.x--
      ship.y--
    }  // TODO: These algorithms are wrong! It's fx. not always +1 on both axes going south east, as x will be 0 going from an even to an odd row as it's currently tiled
    else if (ship.orientation == 90) ship.x--
    
    else if (ship.orientation == 150) {
      if (even) ship.x--
      ship.y++
    }
    
    else if (ship.orientation == 210) {
      if (!even) ship.x++
      ship.y++
    }
    else if (ship.orientation == 270) ship.x++
    else { // 330
      if (!even) ship.x++
      ship.y--
    }

    if (ship.x < 0 || ship.y < 0 || ship.x > height || ship.y > t_width) move_over_edge()
    play_sfx_affirmative()

    // Moving based off updated coordinates. Almost verbatim copy of the "placing ships algorithm" (changed aShip to ship), so if all this works I should extract this to a method
    for (aTile of tiles) {
      if (aTile.x == ship.x && aTile.y == ship.y) {
        let cb = document.getElementById("tiles").getBoundingClientRect();
        let coords = aTile.el.getBoundingClientRect();
        ship.el.style.left = (coords.left - cb.left + 35) + "px" // The last value was adjusted manually to move the ship from the edge of the tile to the center
        ship.el.style.top  = (coords.top - cb.top + 20) + "px"
        break
      }
    }
}

// Old move method, useful for moving outside of tiles, such as over the edge.
function move_over_edge() {
  // We need to move it first for visuals' sake, but this is helpful for faster debugging
  ship.el.parentElement.removeChild(ship.el) 
  ship = null

  // // Get current position
  // curPosLeft = parseInt(ship.el.style.left)
  // curPosTop = parseInt(ship.el.style.top)

  // // Currently it moves left and up equally, which makes sense at 45 degree angles, but we're using 30 degree angles so it should move further on the x-axis than the y-axis
  // // Calculate the move factoring in angles, like base_move * the distance from the nearest 90 degree angle, and base_distance could be 3 or something? Say (90-30) * 3 and (90-60) * 3?
  // if (ship.orientation == 30) {
  //   ship.el.style.left = (curPosLeft - ship_move_distance) + "px"
  //   ship.el.style.top = (curPosTop - ship_move_distance) + "px"
  // }
  // else if (ship.orientation == 330) {
  //   ship.el.style.left = (curPosLeft - ship_move_distance) + "px"
  //   ship.el.style.top = (curPosTop + ship_move_distance) + "px"
  // }

  //play_sfx(base_path, sounds_sink)
  play_sfx(base_path, sounds_edge)
}

// TURNING

function turn_clockwise() {
  if (ship.orientation != 330) ship.orientation += o_degrees
  else ship.orientation = 30
  // array_offset = orientations.indexOf(cur_orientation)
  // if (array_offset == 5) offset = 0
  // else offset = array_offset + 1

  turn_visual("CW")
}


function turn_counter_clockwise() {

  if (ship.orientation != 30) ship.orientation -= o_degrees
  else ship.orientation = 330

  turn_visual("CCW")
}


// TODO: I think it would be easier to decouple the rotation as received from Java from the visual representation of the rotation, as chaging the latter might not mean changing the former
// It's async because we need to sleep while the ship rotates, before it moves and the best practice way of doing this is via a promise (in a thread)
async function turn_visual(direction) {
  cur_orientation = parseInt( ship.el.style.transform.match(/-?\d+/)[0] ) // NOTE: This works as long as I don't use transform for setting anything besides rotation. The last part extracts the first number from the string

  if (direction == "CW") {
    ship.el.style.transform = 'rotate(' + (cur_orientation + o_degrees) + 'deg)' // Originally I wanted to wrap back to zero once we got over 360 degrees, but then instead of rotating the shortest way round it rotates the long one...
  }
  else {
    ship.el.style.transform = 'rotate(' + (cur_orientation - o_degrees) + 'deg)'
  }

  await sleep(1700); // Whatever the transition duration is (ie. the time it takes to rotate)
  move()
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



/* ATTACK / WEAPONS */

const ball  = document.getElementById('change-ammunition-ball')
const chain = document.getElementById('change-ammunition-chain')
const grape = document.getElementById('change-ammunition-grape')
const CANNON = 0
const CHAIN  = 1
const GRAPE  = 2

// TODO: Implement attacking here. We also need support for the player clicking where to attack on the map/tiles, after clicking the attack button.
function attack() {
  if (ship.load == 0) {
    alert('Attacking...')
    ship.load = 2 // It will be decremented by 1 at the start of the next round, making it reach 0 after two "end turns"
    display_current_ammunition() // Update this as ship.load is now above 0, no longer ready to fire
  }
  else alert("Your current weapon isn't loaded. You have to wait at least " + ship.load + " turns.")
}

// TODO: Add turn-based delays to this
function update_ammunition(ammo_clicked) {

  if (ship.load == 0) {
    alert("The cannon is already loaded. Fire it to be able to reload.")
    return
  }
  else if (ship.currentAmmunitionType == ammo_clicked) return // Don't do anything if clicking the currently selected ammunition
  else {

    ship.load = 3 // It will be decremented by 1 at the start of the next round, making it reach 0 after three "end turns"

    ship.currentAmmunitionType = ammo_clicked
    display_current_ammunition() // Now display the updated current ammunition
  }
}

function display_current_ammunition() {
  switch (ship.currentAmmunitionType) {
    case CANNON: 
      current = ball
      ds1 = chain; ds2 = grape
      break
    case CHAIN: 
      current = chain
      ds1 = ball; ds2 = grape
      break
    case GRAPE: 
      current = grape
      ds1 = ball; ds2 = chain
      break
  }
  // Remove the current classes from all ammunition types:
  // Obviously only one can be selected at a time, and as for the active one maybe it already has red and green, where red was added last, and then it will stay red after trying to add the green class, even though the weapon has reloaded.
  ball.classList.remove('text-success', 'text-danger') 
  chain.classList.remove('text-success', 'text-danger')
  grape.classList.remove('text-success', 'text-danger')

  cl = (ship.load == 0)? 'text-success' : 'text-danger'
  current.classList.add(cl)
}


ball.onclick  = () => { update_ammunition(CANNON) }

chain.onclick = () => { update_ammunition(CHAIN) }
grape.onclick = () => { update_ammunition(GRAPE) }

document.getElementById('attack').onclick = attack



/* EVENT BINDINGS */

document.getElementById('music-button').onclick = music_toggle
document.getElementById('sfx-button').onclick = sfx_toggle

document.getElementById('end-turn').onclick = end_turn

document.getElementById('move-arrow').onclick = move
document.getElementById('turn-clockwise').onclick = turn_clockwise
document.getElementById('turn-counter-clockwise').onclick = turn_counter_clockwise
