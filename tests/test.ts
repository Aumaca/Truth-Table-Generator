const expression = "A ^ B ^ !(!B v !A)";
const expressionNoSpace = expression.split(" ").join("").split("");

/**
 * 1 - Take single letters -> (A, B, C)
 * 2 - Take not single letters -> (!A, !B)
 * 3 - Take expressions inside parentheses -> (AvB)vA
 * 4 - Take all operations that need to be done,
 *     including the operators to make operations
 *     in order. -> A, B, !A, !B, A v !C...
 * 5 - Set boolean values to single letters and then make
 *     the logic operations.
 * 6 - 
 */

if (!checkExpression()) {
    throw new Error("Error. The expression is invalid.");
}
const allLetters: string[][] = takeAllLetters();
const letters: string[] = allLetters[0];
const notLetters: string[] = allLetters[1];
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
 * Return arrays of letters and notLetters respectively.
 * @returns {string[][]}
 */
function takeAllLetters(): string[][] {
    let letters: string[] = [];
    let notLetters: string[] = [];
    for (let i = 0; i < expressionNoSpace.length; i++) {
        if (expressionNoSpace[i].match(/[A-Z]/) && !letters.includes(expressionNoSpace[i])) {
            letters.push(expressionNoSpace[i]);
        }
        if (expressionNoSpace[i] === "!" && expressionNoSpace[i + 1] && expressionNoSpace[i + 1].match(/[A-Z]/)) {
            let actual: string = '';
            actual += expressionNoSpace[i] + expressionNoSpace[i + 1];
            !notLetters.includes(actual) ? notLetters.push(actual) : '';
        }
    }
    return [letters, notLetters];
}

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
 * first item is the variable and the second a array of
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
                x % 2 === 0 ? actual[1].push(true) : actual[1].push(false);
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
            let boolValue: boolean = changeActualBool(truthTable[letterIndex][1][i]);
            actual[1].push(boolValue);
        }
        truthTable.push(actual);
    }

    // For each expression inside parenthesis
    const withoutNegation = parenthesesExp.filter(exp => exp[0] !== "!");
    for (let i = 0; i < withoutNegation.length; i++) {
        addVariableToTruthTable(withoutNegation[i].slice(1, -1));
    }

    // For each notExpression
    const notExpressions: string[] = parenthesesExp.filter(exp => exp[0] === "!");
    for (let i = 0; i < notExpressions.length; i++) { // For letter in notLetters
        let actual: [string, boolean[]] = [notExpressions[i], []]; // Set actual array to be pushed to truthTable
        let expressionIndex: number = 0; // Take first number that is index of array containing all values of the letter

        // Return the index of a expression in truthTable to access his boolean values
        let expression: string = notExpressions[i].replace('!', '').replace("(", "").replace(")", "");
        console.log(expression);
        for (let i = 0; i < truthTable.length; i++) {
            if (truthTable[i][0] === expression) {
                expressionIndex = i;
                break;
            }
        }

        // For booleans values in given letter
        for (let i = 0; i < cases; i++) {
            let boolValue: boolean = truthTable[expressionIndex][1][i];
            boolValue === true ? actual[1].push(false) : actual[1].push(true);
        }
        truthTable.push(actual);
    }


    // For each operation
    for (let i = 0; i < allOperations.length; i++) {
        addVariableToTruthTable(allOperations[i]);
    }
    console.log(truthTable);
    return truthTable;

    /**
     * To invert actual boolean value for negations
     */
    function changeActualBool(actualBool: boolean): boolean {
        return (actualBool === true ? false : true);
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
        operation[i] === '(' ? openParentheses++ : '';
        operation[i] === ')' ? openParentheses-- : '';
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