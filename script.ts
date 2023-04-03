const expressionInput = document.getElementById("expression") as HTMLInputElement;

const handleSubmit = (evt: Event) => {
    evt.preventDefault();
    run();
};

function run(): void {
    const expression: string = expressionInput.value;
    const expressionNoSpace = expression.split(" ").join("").split("");
    if (!checkExpression()) {
        throw new Error("Error. The expression is invalid.");
    }
    const letters: string[] = takeLetters();
    const notLetters: string[] = takeNotLetters();
    const parenthesesExp: string[] = takeParenthesesExpressions();
    const allOperations: string[] = takeOperations();
    console.log("Letters: ");
    console.log(letters);
    console.log("Not Letters: ");
    console.log(notLetters);
    console.log("Expressions in Parentheses: ");
    console.log(parenthesesExp);
    console.log("All operations: ");
    console.log(allOperations);
    createRows();

    function checkExpression(): boolean {
        const openParentheses: number = Array.from(expression).filter(value => value == '(').length;
        const closeParentheses: number = Array.from(expression).filter(value => value == ')').length;
        if (openParentheses !== closeParentheses) {
            return false;
        }
        for (let i = 0; i < expressionNoSpace.length; i++) {
            // If there's 2 logical operators in sequence (v^ or ^v or vv)
            if (expressionNoSpace[i].match(/[v^]/g) && expressionNoSpace[i + 1] && expressionNoSpace[i + 1].match(/[v^]/g)) {
                return false;
            }

            // If there's 2 variables in sequence (AB v B)
            if (expressionNoSpace[i].match(/[A-Z]/g) && expressionNoSpace[i + 1] && expressionNoSpace[i + 1].match(/[A-Z]/g)) {
                return false;
            }

            // If there is an opening and closing parentheses after (A v ())
            if (expressionNoSpace[i] === '(' && expressionNoSpace[i + 1] && expressionNoSpace[i + 1] === ')') {
                return false;
            }
        }
        return true;
    }

    /**
    * Returns array of unique variables in found order.
    * @returns {string[]} - Array of unique variables.
    */
    function takeLetters(): string[] {
        let letters: string[] = [];
        for (let i = 0; i < expressionNoSpace.length; i++) {
            if (expressionNoSpace[i].match(/[A-Z]/)) {
                if (!letters.includes(expressionNoSpace[i]) && !expressionNoSpace[i].match(/[v^]/g)) {
                    letters.push(expressionNoSpace[i]);
                }
            }
        }
        return letters;
    };

    /**
     * Returns array of unique variables with "!" before (negation).
     * @returns {string[]} Array of not variables.
     */
    function takeNotLetters(): string[] {
        let notLetters: string[] = [];
        for (let i = 0; i < expressionNoSpace.length; i++) {
            if (expressionNoSpace[i] === "!" && expressionNoSpace[i + 1] && expressionNoSpace[i + 1].match(/[A-Z]/)) {
                let actual: string = '';
                actual += expressionNoSpace[i];
                actual += expressionNoSpace[i + 1];
                if (!notLetters.includes(actual)) {
                    notLetters.push(actual);
                }
            }
        }
        return notLetters;
    };

    /**
     * Returns the indexes of where the characters were found.
     * @param {string} char - Character to be found.
     * @returns {number[]} Array of numbers (indexes).
     */
    function takeIndexs(char: string): number[] {
        let indexs: number[] = [];
        for (let i = 0; i < expressionNoSpace.length; i++) {
            expressionNoSpace[i] === char ? indexs.push(i) : '';
        }
        return indexs;
    }


    /**
     * Returns expressions within parentheses, from innermost to outermost.
     * @returns {string[]} Array with expressions within parentheses.
     */
    function takeParenthesesExpressions(): string[] {
        const openParenthesesIndexs: number[] = takeIndexs('(').reverse();
        let parenthesesExpressions: string[] = [];
        let actualParentheses: string = '';
        let actualNotParentheses: string = '';

        for (let x of openParenthesesIndexs) {
            for (let i = x; ; i++) {
                if (expressionNoSpace[i - 1] === '!' && expressionNoSpace[i] === '(') {
                    actualNotParentheses += "!";
                }
                if (actualNotParentheses.length > 0) {
                    actualNotParentheses += expressionNoSpace[i];
                }
                actualParentheses += expressionNoSpace[i];
                if (expressionNoSpace[i] === ')') {
                    parenthesesExpressions.push(actualParentheses);
                    actualParentheses = "";
                    if (actualNotParentheses.length > 0) {
                        parenthesesExpressions.push(actualNotParentheses);
                        actualNotParentheses = "";
                    }
                    break;
                }
            }
        }
        return parenthesesExpressions;
    }

    /**
     * Returns array with separated operations from expression.
     * @returns {string[]} Array containing allOperations to be made in expression.
     */
    function takeOperations(): string[] {
        let allOperations: string[] = [];
        let actual: string = "";
        let openParentheses: number = 0;
        // Example: AvB^(AvB)
        for (let i = 0; i < expressionNoSpace.length; i++) {
            // If actual is empty and [i] is a operator
            if (expressionNoSpace[i].match(/[v^]/g) && actual === "") {
                actual += "(" + allOperations[allOperations.length - 1] + ")";
            }

            actual += expressionNoSpace[i];

            // To track parentheses
            expressionNoSpace[i] === "(" ? openParentheses++ : '';
            expressionNoSpace[i] === ")" ? openParentheses-- : '';

            // To check "!"
            if (expressionNoSpace[i] === "!") {
                continue;
            }

            // Before || -> would push AvB, remaining ^(AvB)
            // After  || -> would push (AvB)^(AvB)

            console.log(expressionNoSpace);

            if (openParentheses === 0) {
                // If previous element is operator and [i] is a uppercase letter
                // For simple expressions like -> A v B
                if (i > 0 && expressionNoSpace[i - 1].match(/[v^]/g) && expressionNoSpace[i].match(/[A-Z]/g)) {
                    allOperations.push(actual);
                    actual = "";
                }

                // If previous element is a exclamation mark and the pre-previous is a operator and [i] is a uppercase letter
                // For simple expressions like -> A v B
                if (i > 0 && expressionNoSpace[i - 2] && expressionNoSpace[i - 2].match(/[v^]/g) && expressionNoSpace[i - 1] === "!" && expressionNoSpace[i].match(/[A-Z]/g)) {
                    allOperations.push(actual);
                    actual = "";
                }

                if (!expressionNoSpace[i + 1] && actual !== "") {
                    allOperations.push(actual);
                    actual = "";
                }
            }
        }
        return allOperations;
    }


    /**
     * - Calculate how many cases the truth table has.
     * - Create truthTable, array which store arrays with the
     * first item being variable and the second an array of
     * boolean values.
     * - Create the boolean values to the variables and make 
     * operations.
     */

    /**
     * Create rows using arrays with the variable followed by his boolean values.
     * @returns {[string, boolean[]][]} 
     */
    function createRows(): [string, boolean[]][] {
        const cases: number = 2 ** letters.length;
        let truthTable: [string, boolean[]][] = [];

        // For each letter
        for (let i = 0; i < letters.length; i++) {
            let actual: [string, boolean[]] = [letters[i], []];
            // If first letter
            if (i === 0) {
                for (let x = 0; x < cases; x++) {
                    if (x % 2 === 0) {
                        actual[1].push(true);
                    } else {
                        actual[1].push(false);
                    }
                }
            } else {
                const maxTrack: number = (2 ** (i + 1)) / 2;
                let actualTrack: number = 0;
                let actualBool: boolean = true;
                for (let x = 0; x < cases; x++) {
                    if (actualTrack == maxTrack) {
                        actualTrack = 0;
                        actualBool = changeActualBool(actualBool);
                    }
                    actualTrack++;
                    actual[1].push(actualBool);
                }
            }
            truthTable.push(actual);
        }

        // For each notLetter
        for (let i = 0; i < notLetters.length; i++) { // For letter in notLetters
            let actual: [string, boolean[]] = [notLetters[i], []]; // Set actual array to be pushed to truthTable
            let letterIndex: number = 0; // Take first number that is index of array containing all values of the letter

            // Return the index of a letter in truthTable to access his boolean values
            let letter: string = notLetters[i].replace('!', '');
            for (let i = 0; i < truthTable.length; i++) {
                if (truthTable[i][0] === letter) {
                    letterIndex = i;
                    break;
                }
            }

            // For booleans values in given letter
            for (let i = 0; i < cases; i++) {
                let boolValue: boolean = truthTable[letterIndex][1][i];
                boolValue === true ? actual[1].push(false) : actual[1].push(true);
            }
            truthTable.push(actual);
        }

        // For each expression inside parenthesis
        for (let i = 0; i < parenthesesExp.length; i++) {
            addVariableToTruthTable(parenthesesExp[i].slice(1, -1))
        }

        // For each operation
        for (let i = 0; i < allOperations.length; i++) {
            addVariableToTruthTable(allOperations[i]);
        }
        console.log(truthTable);
        return truthTable;

        /**
         * To invert actual boolean value for takeLetters()
         */
        function changeActualBool(actualBool: boolean): boolean {
            if (actualBool === true) {
                return false;
            }
            return true;
        }

        /**
         * Receive operation and then make all necessary steps to
         * make operation and set to truthTable array.
         * It's not used to process letters and notLetters.
         * @param {string} operation - Simple operation
         */
        function addVariableToTruthTable(operation: string): void {
            let actual: [string, boolean[]] = [operation, []]; // Set array to the operation
            let operationArray: string[] = splitOperation(operation); // Split expression
            const [firstVar, operator, secondVar] = operationArray; // Takes expression's elements
            let firstVarValues: boolean[] = getValuesTruthTable(firstVar, truthTable);
            let secondVarValues: boolean[] = getValuesTruthTable(secondVar, truthTable);
            // Generate conditionals results for each case and store to actual[1]
            for (let i = 0; i < cases; i++) {
                let actualValueCase: boolean = false;
                if (operator === 'v') {
                    if (firstVarValues[i] || secondVarValues[i]) {
                        actualValueCase = true;
                    } else {
                        actualValueCase = false;
                    }
                }
                if (operator === '^') {
                    if (firstVarValues[i] && secondVarValues[i]) {
                        actualValueCase = true;
                    } else {
                        actualValueCase = false;
                    }
                }
                actual[1].push(actualValueCase);
            }
            truthTable.push(actual);
        }
    }


    /**
     * Returns the array containing separately the variables and operator from operation.
     * @param {string[]} operation - String with operation.
     * @returns {string[]} An array containing each value separately.
     */
    function splitOperation(operation: string): string[] {
        let operationArray: string[] = [];
        let actual: string = '';
        let openParentheses: number = 0;
        // To split values
        for (let i = 0; i < operation.length; i++) {
            if (operation[i] === '(') {
                openParentheses++;
            }
            if (operation[i] === ')') {
                openParentheses--;
            }

            actual += operation[i];

            if (operation[i] === '!' || openParentheses > 0) {
                continue;
            }
            operationArray.push(actual);
            actual = '';
        }
        return operationArray;
    }


    /**
     * Returns the boolean values of the given variable.
     * @param {string} variable 
     * @param {[string, boolean[]][]} truthTable 
     * @returns {boolean[]} An array of boolean values for the given variable.
     */
    function getValuesTruthTable(variable: string, truthTable: [string, boolean[]][]): boolean[] {
        let index: number = 0;
        if (variable.indexOf("(") > -1 && variable.indexOf(")") > -1) {
            variable = variable.slice(1, -1);
        }
        for (let i = 0; i < truthTable.length; i++) {
            if (truthTable[i][0] === variable) {
                index = i;
                break;
            }
        }
        return truthTable[index][1];
    }
}