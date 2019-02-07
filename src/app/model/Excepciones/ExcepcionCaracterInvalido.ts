export class ExcepcionCaracterInvalido{
    public linea: number;
    public columna: number;
    public caracter: string;

    constructor(linea: number, columna: number, caracter: string){
        this.linea = linea;
        this.columna = columna;
        this.caracter = caracter;
    }    
}