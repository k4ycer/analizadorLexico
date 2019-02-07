import { FSM } from './model/FSM';
import { Component } from '@angular/core';
import { CharUtils } from './model/CharUtils';
import { AnalizadorLexico } from './model/AnalizadorLexico';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	title = 'analizadorLexicoTypescript';

	ngOnInit(){
		let input = "while hola number hey\n Como for if nada \n null true";

		let analizadorLexico = new AnalizadorLexico(input);
		try{
			let tokens = analizadorLexico.tokenizar();
			console.log("tokens", tokens);
		}catch(excepcion){
			console.log(`Caracter invalido ${excepcion.caracter} en la linea ${excepcion.linea}, columna ${excepcion.columna}`);
		}		
	}
}
