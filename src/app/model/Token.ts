import { TipoToken } from './TipoToken';

export class Token{

    public Tipo: TipoToken;
    public Valor: string;
    public Linea: number;
    public Columna: number;

    constructor(tipo?: TipoToken, valor?: string, linea?: number, columna?: number){
        this.Tipo = tipo;
        this.Valor = valor;
        this.Linea = linea;
        this.Columna = columna;
    }
}