$( document ).ready(function() {

	$( "#save" ).click(function() {


		var minutes = parseInt( $("#minutes").val() );
		var type = parseInt( $("#type").val() );


		if(minutes != NaN && minutes != null && minutes != undefined && minutes >= 1){
			console.log("Save");
			console.log(minutes);


			localStorage.sportsDrinksTime = minutes;

			if(type == 0){
				localStorage.sportsDrinksTypeRandom = true;
			}
			else{
				localStorage.sportsDrinksTypeRandom = false;
			}
			console.log(type);
			window.location.href = "sportsDrinks.html";
		}
		else{
			console.log("Numero de minutos inválido!!!!");
		}
	});

});



