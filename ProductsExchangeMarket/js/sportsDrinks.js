// Model for index.html page
var Model = {
	temporizador: 1800000, //meia hora
	timeLeft: ko.observable('--'),

	isTesting: false,
	secondsTest: 10,
	sorteios: ko.observable(0), // o numero de sorteios


	products: ko.observableArray([
		{id: 1, name: "GIN", pvp: 4.00.toFixed(2) + " €", price: ko.observable(4.00.toFixed(2) + " €"), minPrice: ko.observable("--"), maxPrice: ko.observable("--"), min: 250, max: 400, image:""},
		{id: 2, name: "FINO", pvp: 1.00.toFixed(2) + " €", price: ko.observable(1.00.toFixed(2) + " €"), minPrice: ko.observable("--"), maxPrice: ko.observable("--"), min: 60, max: 100, image:""},
		{id: 3, name: "BEIRÃO", pvp: 2.80.toFixed(2) + " €", price: ko.observable(2.80.toFixed(2) + " €"), minPrice: ko.observable("--"), maxPrice: ko.observable("--"), min: 180, max: 280, image:""},
		{id: 4, name: "CUTTY SARK", pvp: 3.00.toFixed(2) + " €", price: ko.observable(3.00.toFixed(2) + " €"), minPrice: ko.observable("--"), maxPrice: ko.observable("--"), min: 200, max: 300, image:""},
		{id: 5, name: "CAIPIRINHA", pvp: 3.00.toFixed(2) + " €", price: ko.observable(3.00.toFixed(2) + " €"), minPrice: ko.observable("--"), maxPrice: ko.observable("--"), min: 200, max: 300, image:""},

	]),
	firstTime: true,
	init: function(){
		var me = Model;

		me.getSportsDrinksTime();



		me.getProduct();


		if(me.firstTime){
			me.listenKeyPress();
			me.firstTime = false;
		}


		if(me.isTesting){
			inter = setInterval(function(){
				me.getProduct();
			}, me.secondsTest*1000);
		}
		else{
			inter = setInterval(function(){
				me.getProduct();
			}, me.temporizador);
		}


		//Contador de mudança de producto
		//var secconds = me.temporizador/1000;
		//countdown( "countdown", 0 , secconds );
		//countdown( "countdown", 0 , secconds );


	},

	/**
	 * Carrega o valor definido no local storage para o temporizador
	 */
	getSportsDrinksTime: function(){
		var me = Model;

		var minutes = localStorage.sportsDrinksTime;

		if(minutes != NaN && minutes != null && minutes != undefined && minutes >= 1){
			me.temporizador = minutes * 60 * 1000;
		}
	},

	/**
	 * Quando o user carrega nas teclas '1' '2' e '3'
	 */
	listenKeyPress: function () {
		var me = Model;

		var key1 = false;//charCode -> 49
		var key2 = false;//charCode -> 50
		var key3 = false;//charCode -> 51

		$(document).keypress(function(event) {
			if(event.charCode == 49){
				key1 = true;
			}
			if(event.charCode == 50){
				key2 = true;
			}
			if(event.charCode == 51){
				key3 = true;
			}

			if(key1 && key2 && key3){

				if(me.working == false){
					console.log("Refresh");
					key1 = false;
					key2 = false;
					key3 = false;


					clearInterval(inter);
					me.init();
				}
				else{
					console.error("Cannot start new, until finish the running process!!!");
				}



			}
		});
	},


	/**
	 * Responsavel por atribuir o índice do próximo produto
	 * @returns		o índice do próximo produto
     */
	getNextIndex: function () {
		var me = Model;

		var isRandom = localStorage.sportsDrinksTypeRandom;

		if(isRandom == true || isRandom == "true"){
			return me.getRandom(0, me.products().length-1);
		}
		else{
			if(me.lastProductIndex == null || me.lastProductIndex >= me.products().length-1){
				return 0;
			}
			else {
				return me.lastProductIndex + 1;
			}
		}

	},

	//Guarda o ultimo indice usado
	lastProductIndex: null,
	/**
	 * Define o preço de um producto
	 */
	working: false,
	getProduct: function(){
		var me = Model;

		me.sorteios( me.sorteios() + 1 );
		me.working = true;
		console.log("A sortear...");


		me.playSound();

		//Limpa o contador
		clearCountDown();

		//Contador de mudança de producto
		var secconds = 0;
		if(me.isTesting){
			secconds = me.secondsTest;
		}
		else{
			secconds = me.temporizador/1000;
		}

		countdown( "countdown", 0 , secconds );


		me.resetPrices(function(){


			me.animateSelection();

			setTimeout(function() {


				//var productIndex = me.getRandom(0, me.products().length-1);
				var productIndex = me.getNextIndex();

				while (productIndex == me.lastProductIndex) {
					console.log("Random igual ao anterior");
					productIndex = me.getRandom(0, me.products().length - 1);
				}

				console.log("########		LAST PROD INDEX	#########");
				console.log(productIndex);
				console.log("########################################");
				me.lastProductIndex = productIndex;

				var product = me.products()[productIndex];

				console.log("O produto:");
				console.log(product);

				var minimo = me.products()[productIndex].min;
				var maximo = me.products()[productIndex].max;

				var productPrice = me.getRandom(minimo, maximo);

				//product.price = productPrice;

				console.log("O preço:");
				console.log(productPrice);
				var roundedPrice = parseFloat(me.getRoundedPrice(productPrice, minimo, maximo) / 100).toFixed(2);

				//caso o preço seja o valor normal, retira 5 centimos
				if (roundedPrice == (me.products()[productIndex].max / 100).toFixed(2)) {
					roundedPrice -= 0.05;
				}

				console.log("O preço arredondado:");
				console.log(roundedPrice);


				//Define o novo preço no array
				me.products()[productIndex].price(parseFloat(roundedPrice).toFixed(2) + " €");


				//Define os novos minimos e máximos


				//caso "--" o min e max

				if (me.products()[productIndex].minPrice() == "--") {
					me.products()[productIndex].minPrice(roundedPrice + " €");
					me.products()[productIndex].maxPrice(roundedPrice + " €");
				}
				else {
					var minInEuro = parseFloat(me.products()[productIndex].minPrice()).toFixed(2);
					var maxInEuro = parseFloat(me.products()[productIndex].maxPrice()).toFixed(2);

					console.log("Mínimo ate agora:");
					console.log(minInEuro);
					console.log("Máximo ate agora:");
					console.log(maxInEuro);

					if (roundedPrice < minInEuro) {
						//novo mínimo
						me.products()[productIndex].minPrice(roundedPrice + " €");
					}

					if (roundedPrice > maxInEuro) {
						//Novo máximo
						me.products()[productIndex].maxPrice(roundedPrice + " €");
					}
				}


				//aspectos visuais
				me.resetLineColor(function () {

					//var color = '#'+Math.floor(Math.random()*16777215).toString(16);
					//var color = '#495E00';
					//$('#line_'+me.products()[ productIndex ].id).css('background-color', color);


					$('#line_' + product.id).addClass("highlight");

					me.working = false;
				});
			}, 2500);


			//Reordena o array e coloca o produto alterado em 1º
			//me.reorderArray( productIndex );



		});








	},

	/*reorderArray:function(productIndex){
		var me = Model;

		var newFirst = me.products()[ productIndex ];

		$.each(me.products(), function( index, product ) {
			product( null );
		});

	},*/
	resetPrices: function(cb){
		var me = Model;

		$.each(me.products(), function( index, product ) {
			product.price( parseFloat(product.max/100).toFixed(2) + " €" );
		});

		if(cb) cb();
	},

	animateSelection: function(){
		var me = Model;

		var index = 0;
		var index2 = 0;
		var counter = 0;

		var int = setInterval(function(){
			if(index > me.products().length){
				index = 0;
			}


			$('#line_'+index).addClass( "highlightAnimation" );

			setTimeout(function(){
				if(index2 > me.products().length){
					index2 = 0;
				}

				$('#line_'+index2).removeClass( "highlightAnimation" );
				index2++;
			},50);

			index++;
			counter++;
			if( counter >= 50){
				clearInterval(int);
			}

		}, 50);


	},

	resetLineColor: function(cb){
		var me = Model;

		$.each(me.products(), function( index, product ) {
			//$('#line_'+product.id).css('background-color', '#3d400b');
			$('#line_'+product.id).removeClass( "highlight" );
		});

		if(cb) cb();
	},

	/**
	 * Gera numero aleatorio entre o min e max
	 * @param min
	 * @param max
	 * @returns o número aleatório
	 */
	getRandom: function(min, max){
		var me = Model;
		//return Math.floor(Math.random() * max) + min;
		//return Math.random() * max + min;
		//return Math.floor(Math.random() * (max - min + 1)) + min;
		var rand =  Math.round(Math.random() * (max - min) + min);

		return rand;
	},

	getRoundedPrice: function(random, min, max){
		var randParts = random+"".split("");
		var randLength = randParts.length - 1;

		var roundedVal = 0;

		var lastNum = parseInt( randParts[randLength] );
		if(lastNum > 5){
			var toSum = 10 - lastNum;
			roundedVal = random + toSum;
		}
		else if(lastNum < 5){
			roundedVal = random - lastNum;
		}

		if(roundedVal < min || roundedVal > max){
			roundedVal = random;
		}

		return roundedVal;
	},
	hornNumber: 3,
	playSound: function(){
		var me = Model;

		//if(me.hornNumber>=4) me.hornNumber = 1;

		var audio = new Audio('./sounds/horn'+me.hornNumber+'.mp3');
		audio.volume = 0.2;
		audio.play();

		//me.hornNumber++;
	}
}

$( document ).ready(function() {
	ko.applyBindings(Model);

	Model.init();
});



