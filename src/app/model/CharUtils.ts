export class CharUtils{
    public static isLetter(character: string): boolean{
        let match = character.match(/[a-zA-Z]/i);
        return ((character.length == 1) && (match != null));
    }

    public static isDigit(digit: string): boolean{
        let match = digit.match(/[0-9]/i);
        return match != null;
    }

    public static isWhitespace(character: string): boolean{
        return (character == " ");
    }

    public static isNewLine(character: string): boolean{
        return (character == "\n");
    }
}