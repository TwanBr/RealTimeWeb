const http = require('http');
const port = process.env.PORT || 3000

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('

          
<html>
<head>

<style>
#status {
	height: 150px;
}
</style>

<script src="jquery-3.3.1.js"></script>
<script>

$(document).ready( function() {
    let playerName = prompt('Please player, enter you name:','Default');

	// initial state of the game
	let state = {fuel: 100, xp: 0, food: 0, planet: 'Earth'};
	let maxF = 100;
	let gameIsRunning = true;

	// the display that will show what happens
	$('#status').html( 'Initial status: ' + JSON.stringify(state) );

	function quit(){
		$('#status').html( 'You logged out! ' +
							'HighScore: ...' + state.food );
		gameIsRunning = false;
		enterBtn.disabled = true;

        $.getJSON( "highscores.json", function( data ) {
            console.log( 'the result:' , data);
            $('#status').append('<br>'+JSON.stringify(data));

            let scoreObj = data.filter( (element)=> element.username == playerName);
            let scoreValue = 0;
            if (scoreObj.length>=1){
                scoreValue = scoreObj[0].bestScore;
            }
            console.log( scoreObj , scoreObj.length , scoreValue);
            if (state.food > scoreValue){
                alert(`Congratulations you just surpassed your previous highscore!
\n
old = ${scoreValue} ; new = ${state.food}`
);
            }
        })
	}

	//$('#enterBtn').on('click', function(){
	$('#enterBtn').click( ()=>{
		let text = `Player ${playerName}: your status is now ${JSON.stringify(state)}`;

		switch( $('#userInput').val().toUpperCase() ){
			case 'QUIT':{
				quit();
				return;
			} break;
			case 'SEARCH':{
				let dice = Math.floor(Math.random()*6)+1;
				if (dice<=3){
					text += '<br/>you searched on' + state.planet + ' and found something...';
					dice = Math.floor(Math.random()*6)+1;
					if (dice==1){
            text += '<br/>... fuel.'
            if ((state.fuel + dice) < maxF){
						state.fuel += Math.floor(Math.random()*6)+1;
            }
						else {
            	state.fuel = maxF;
            }
					}
					if ((dice==2) || (dice==3)) {
						text += '<br/>... food!';
						state.food += Math.floor(Math.random()*6)+1;
						//state.xp += Math.floor(Math.random()*6)+1;
					}
				}
				else {
					text += '<br/>you found nothing on ' + state.planet + '.';
				}
			} break;
      case 'MOVE':{
        	let dice = Math.floor(Math.random()*6)+1;
        	let roll = Math.floor(Math.random()*6)+1; //Cost of travel
    			if (state.fuel <= roll) {
        			state.planet = 'Earth';
          		text += '<br/>you ran out of fuel and moved back to Earth.';
              state.fuel = maxF;
        	}
					else {
        			if (dice<=3){
          			state.planet = 'Jupiter';
                state.fuel -= roll;
        			}
        			if (dice>3){
          			state.planet = 'Venus';
                state.fuel -= roll;
        			}
              text += '<br/>you moved to ' + state.planet + '.';
        		}
      } break;
			case 'RETURN HOME':{
					text += '<br/>you are home!';
					state.fuel = maxF;
					state.planet ='Earth';
			} break;
			default: {
				text += '<br/>...command not recognized...';
			}
		}
		$('#status').html( text );
	});

});
</script>

<title>SpaceShip</title>
</head>
<body>
	<h1>SpaceShip</h1>
  	<img
	src= ' /img/cookies-in-space.jpg';
	height=250px;
	width=400px; />
	<p>

		<p><h2>Situation</h2>
        <div>Instructions - use these commands to play:
            <br>SEARCH, MOVE, RETURN HOME
            <br>And QUIT to finish the game.
        </div>
		<div id="status">...</div>
		</p>

		<hr/>

		<b>What do you want to do? (search/move/return home/quit)</b>
		<br/>
		<input type="text" id="userInput"></input>
		<button type="button" id="enterBtn">ENTER</button>

	</p>

</body>
</html>

          
          
          
          ');
});

server.listen(port,() => {
  console.log(`Server running at port `+port);
});
