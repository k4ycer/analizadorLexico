const NoNextState = -1;

export class FSM{
    public states: Set<number>;
    public initialState: number;
    public acceptingStates: Set<number>;
    public nextState: any;

    constructor(states: Set<number>, initialState: number, acceptingStates: Set<number>, nextState: any){
        this.states = states;
        this.initialState = initialState;
        this.acceptingStates = acceptingStates;
        this.nextState = nextState;
    }

    /// Runs this FSM on the specified 'input' string.
    /// Returns 'true' if 'input' or a subset of 'input' matches
    /// the regular expression corresponding to this FSM.
    public run(input): any{
        let currentState = this.initialState;
        let string = "";

        for (let i = 0, length = input.length; i < length; ++i) {
            let character = input.charAt(i);
            let nextState = this.nextState(currentState, character);        
            
            if (nextState === NoNextState) {
                break;
            }
            
            string += character;
            currentState = nextState;
        }

        return {aceptado: this.acceptingStates.has(currentState), string: string};
    }
}