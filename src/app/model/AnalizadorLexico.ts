import { FSM } from './FSM';
import { Keywords } from './constants/Keywords';
import { FutureReservedWords } from './constants/FutureReservedWords';
import { BooleanLiterals } from './constants/BooleanLiterals';
import { PredefinedTypes } from './constants/PredefinedTypes';
import { CharUtils } from './CharUtils';
import { Token } from './Token';
import { TipoToken } from './TipoToken';
import { AccessibilityModifiers } from './constants/AccessibilityModifiers';
import { NullLiterals } from './constants/NullLiterals';
import { Punctuators } from './constants/Punctuators';
import { ExcepcionCaracterInvalido } from './Excepciones/ExcepcionCaracterInvalido';

export class AnalizadorLexico{
    public input: string;
    public posicion: number;
    public linea: number;
    public columna: number;

    constructor(input: string){
        this.input = input;
        this.posicion = 0;
        this.linea = 0;
        this.columna = 0;
    }

    public tokenizar(): Token[]{
        let token = this.getSiguienteToken();
        let tokens: Token[] = [];

        while(token.Tipo != TipoToken.EndOfInput){
            tokens.push(token);
            token = this.getSiguienteToken();
        }

        return tokens;
    }

    public getSiguienteToken(): Token{
        let caracterActual: string,
            reconocido: string,
            token: Token;

        if(this.posicion >= this.input.length){
            return new Token(TipoToken.EndOfInput);
        }

        // Nos saltamos los espacios es blanco y los saltos de linea
        this.ignorarEspaciosYSaltos();

        caracterActual = this.input.charAt(this.posicion);


        if(CharUtils.isLetter(caracterActual)){
            reconocido = this.obtenerPalabra();

            if(this.esAccesibilityModifier(reconocido)){
                token = new Token(TipoToken.AccessibilityModifier, reconocido, this.linea, this.columna);
            }else if(this.esBooleanLiteral(reconocido)){
                token = new Token(TipoToken.BooleanLiteral, reconocido, this.linea, this.columna);
            }else if(this.esFutureReservedWord(reconocido)){
                token = new Token(TipoToken.FutureReservedWord, reconocido, this.linea, this.columna);
            }else if(this.esKeyword(reconocido)){
                token = new Token(TipoToken.Keyword, reconocido, this.linea, this.columna);
            }else if(this.esNullLiteral(reconocido)){
                token = new Token(TipoToken.NullLiteral, reconocido, this.linea, this.columna);
            }else if(this.esPredefinedType(reconocido)){
                token = new Token(TipoToken.PredefinedType, reconocido, this.linea, this.columna);
            }else if(this.esPunctuator(reconocido)){
                token = new Token(TipoToken.Punctuator, reconocido, this.linea, this.columna);
            }else{
                token = new Token(TipoToken.Identifier, reconocido, this.linea, this.columna);
            }
        }else if(CharUtils.isDigit(caracterActual)){
            reconocido = this.reconocerNumero();       
            token = new Token(TipoToken.DecimalLiteral, reconocido, this.linea, this.columna);
        }else{
            let exepcion = new ExcepcionCaracterInvalido(this.linea, this.columna, this.input.charAt(this.posicion));
            throw exepcion;
        }

        if(!token){
            let exepcion = new ExcepcionCaracterInvalido(this.linea, this.columna, this.input.charAt(this.posicion));
            throw exepcion;
        }

        this.posicion += reconocido.length;
        this.columna += reconocido.length;

        return token;
    }    

    private obtenerPalabra(): string{
        let palabra = '';
        let posicion = this.posicion;

        while(posicion < this.input.length){
            let caracter = this.input.charAt(posicion);
            if(!(CharUtils.isLetter(caracter) || CharUtils.isDigit(caracter) || caracter == "_")){
                break;
            }

            palabra += caracter;
            posicion++;
        }        

        return palabra;
    }

    private esAccesibilityModifier(palabra: string){
        return AccessibilityModifiers.includes(palabra);
    }

    private esBooleanLiteral(palabra: string){
        return BooleanLiterals.includes(palabra);
    }

    private esFutureReservedWord(palabra: string){
        return FutureReservedWords.includes(palabra);
    }

    private esKeyword(palabra: string){
        return Keywords.includes(palabra);
    }

    private esNullLiteral(palabra: string){
        return NullLiterals.includes(palabra);
    }

    private esPredefinedType(palabra: string){
        return PredefinedTypes.includes(palabra);
    }

    private esPunctuator(palabra: string){
        return Punctuators.includes(palabra);
    }

    private reconocerNumero(): string{
        let fsm: FSM = this.crearAutomataReconoceNumeros();

        let inputFsm = this.input.substring(this.posicion);

        let {aceptado, string} = fsm.run(inputFsm);

        return aceptado ? string : null;
    }

    private ignorarEspaciosYSaltos(){
        let whitespaceOrNewLine = true;
        while(whitespaceOrNewLine){
            whitespaceOrNewLine = false;
            let newLine = this.input.charAt(this.posicion) + this.input.charAt(this.posicion+1);
            let matchCR = newLine.match(/\r/);
            let matchLF = newLine.match(/\n/);
            if( matchCR != null || matchLF != null){
                this.posicion += 2;
                this.linea += 1;
                this.columna = 0;
                whitespaceOrNewLine = true;
            }
            if(CharUtils.isWhitespace(this.input.charAt(this.posicion))){
                this.posicion += 1;
                this.columna += 1;
                whitespaceOrNewLine = true;
            }
        }    
    } 

    private crearAutomataReconoceNumeros(): FSM{
        let Estado = {
            Inicial: 1,
            Entero: 2,
            EmpezarNumeroConParteFraccional: 3,
            NumeroConParteFraccional: 4,
            EmpezarNumeroConExponente: 5,
            EmpezarNumeroConExponenteSigno: 6,
            NumeroConExponente: 7,
            NoSiguienteEstado: -1
        };

        let siguienteEstado = (estadoActual: number, caracter: string) => {
            switch(estadoActual){
                case Estado.Inicial:
                    if(CharUtils.isDigit(caracter)){
                        return Estado.Entero;
                    }
                    break;
                case Estado.Entero:
                    if(CharUtils.isDigit(caracter)){
                        return Estado.Entero;
                    }

                    if(caracter === '.'){
                        return Estado.EmpezarNumeroConParteFraccional;
                    }

                    if(caracter.toLowerCase() === 'e'){
                        return Estado.EmpezarNumeroConExponente;
                    }

                    break;
                case Estado.EmpezarNumeroConParteFraccional:
                    if(CharUtils.isDigit(caracter)){
                        return Estado.NumeroConParteFraccional
                    }

                    break;
                case Estado.NumeroConParteFraccional:
                    if(CharUtils.isDigit(caracter)){
                        return Estado.NumeroConParteFraccional;
                    }

                    if(caracter.toLowerCase() === 'e'){
                        return Estado.EmpezarNumeroConExponente;
                    }

                    break;

                case Estado.EmpezarNumeroConExponente:
                    if(caracter === "+" || caracter === "-"){
                        return Estado.EmpezarNumeroConExponenteSigno;
                    }

                    if(CharUtils.isDigit(caracter)){
                        return Estado.NumeroConExponente;
                    }

                    break;

                case Estado.EmpezarNumeroConExponenteSigno:
                    if(CharUtils.isDigit(caracter)){
                        return Estado.NumeroConExponente;
                    }

                    break;
                
                default:
                    break;
            }

            return Estado.NoSiguienteEstado;
        };

        return new FSM(
            new Set([Estado.Inicial, Estado.Entero, Estado.EmpezarNumeroConParteFraccional, Estado.NumeroConParteFraccional, Estado.EmpezarNumeroConExponente, Estado.EmpezarNumeroConExponenteSigno, Estado.EmpezarNumeroConExponente, Estado.NoSiguienteEstado]),
            Estado.Inicial,
            new Set([Estado.Entero, Estado.NumeroConParteFraccional, Estado.NumeroConExponente]),
            siguienteEstado);
    }
}