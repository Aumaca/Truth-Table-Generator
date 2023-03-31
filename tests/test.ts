const expression = "A ^ B v (A v B)";

/**
 * --- Problem: !(A ^ B)
 * - The algorithm is trying to make an unsuccessful operation with !(A & B).
 * - parenthesesExp has the correct order.
 * - resolution: exclude in allOperations values that exist in parenthesesExp,
 * and then add the values of parenthesesExp to the beggining of the allOperations array.
 */
if (!checkExpression()) {
    throw new Error("Error");
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
    const expWithoutSpace: string[] = (expression.replace(/\s/g, '')).split('');
    const openParentheses: number = Array.from(expression).filter(value => value == '(').length;
    const closeParentheses: number = Array.from(expression).filter(value => value == ')').length;
    if (openParentheses !== closeParentheses) {
        return false;
    }
    for (let i = 0; i < expWithoutSpace.length; i++) {
        // If there's 2 logical operators in sequence (v^ or ^v or vv)
        if (expWithoutSpace[i].match(/[v^]/g) && expWithoutSpace[i + 1] && expWithoutSpace[i + 1].match(/[v^]/g)) {
            return false;
        }

        // If there's 2 variables in sequence (AB v B)
        if (expWithoutSpace[i].match(/[A-Z]/g) && expWithoutSpace[i + 1] && expWithoutSpace[i + 1].match(/[A-Z]/g)) {
            return false;
        }

        // If there is an opening and closing parentheses after (A v ())
        if (expWithoutSpace[i] === '(' && expWithoutSpace[i + 1] && expWithoutSpace[i + 1] === ')') {
            return false;
        }
    }
    return true;
}

/**
 * Returns array with unique alphabets characters in found order.
 */
/**
 * Returns array of unique variables in found order.
 * @returns {string[]} - Array of unique variables.
 */
function takeLetters(): string[] {
    let letters: string[] = [];
    for (let i = 0; i < expression.length; i++) {
        if (expression[i].match(/[A-Z]/)) {
            if (!letters.includes(expression[i]) && !expression[i].match(/[v^]/g)) {
                letters.push(expression[i]);
            }
        }
    }
    return letters;
};

/**
 * Returns array of unique variables with "!" before (negation).
 * @returns {string[]} Array of not variables.
 */
function takeNotLetters() {
    let notLetters: string[] = [];
    for (let i = 0; i < expression.length; i++) {
        if (expression[i] === "!" && expression[i + 1] && expression[i + 1].match(/[A-Z]/)) {
            let actual: string = '';
            actual += expression[i];
            actual += expression[i + 1];
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
    for (let i = 0; i < expression.length; i++) {
        expression[i] === char ? indexs.push(i) : '';
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
            if (expression[i - 1] === '!' && expression[i] === '(') {
                actualNotParentheses += "!";
            }
            if (actualNotParentheses.length > 0) {
                actualNotParentheses += expression[i];
            }
            actualParentheses += expression[i];
            if (expression[i] === ')') {
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
    const expWithoutSpace: string[] = expression.split(' '); // For some motive there is having '(A' and 'B)'????? Here's the motive of the problem
    let allOperations: string[] = [];
    let actual: string = '';
    console.log(expWithoutSpace);
    for (let i = 0; i < expWithoutSpace.length; i++) {
        // If [i] is 'v' or '^' AND
        // actual is empty THEN
        // actual receive previous expression inside parentheses
        // example: vB -> (AvB)vB

        if (expWithoutSpace[i].match(/[v^]/g) && actual.length === 0) {
            actual += "(" + allOperations[allOperations.length - 1] + ")";
        }

        actual += expWithoutSpace[i];

        // If theres a previous char AND
        // previous char is 'v' or '^' THEN
        // push to allOperations and reset actual
        // example: AvB
        if (expWithoutSpace[i - 1] && expWithoutSpace[i - 1].match(/[v^]/g)) {
            allOperations.push(actual);
            actual = '';
        }
    }
    return allOperations;
}


function changeActualBool(actualBool: boolean): boolean {
    if (actualBool === true) {
        return false;
    }
    return true;
}


/**
 * - Calculate how many cases the truth table has.
 * - Create allCases, array which store arrays with the
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
    let allCases: [string, boolean[]][] = [];

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
        allCases.push(actual);
    }

    // For each not letter:
    // 1 - To each letter in not letter, first is necessary to take the index in which the variable and his values are in allCases.
    // 2 - For each boolean value, we will invert the boolean value and push to actual
    for (let i = 0; i < notLetters.length; i++) { // For letter in notLetters
        let actual: [string, boolean[]] = [notLetters[i], []]; // Set actual array to be pushed to allCases
        let letterIndex: number = 0; // Take first number that is index of array containing all values of the letter

        // Return the index of a letter in allCases to access his boolean values
        let letter: string = notLetters[i].replace('!', '');
        for (let i = 0; i < allCases.length; i++) {

            if (allCases[i][0] === letter) {
                letterIndex = i;
                break;
            }
        }

        // For booleans values in given letter
        for (let i = 0; i < cases; i++) {
            let boolValue: boolean = allCases[letterIndex][1][i];
            boolValue === true ? actual[1].push(false) : actual[1].push(true);
        }
        allCases.push(actual);
    }

    // For each operation
    for (let i = 0; i < allOperations.length; i++) {
        let operation: string = allOperations[i]; // Take operation
        let actual: [string, boolean[]] = [operation, []]; // Set array to the operation
        let operationArray: string[] = splitOperation(operation); // Split operation to get single values

        // To get values and make operation
        let firstVar: string = operationArray[0]; // A or (A v B)
        let operator: string = operationArray[1]; // v
        let secondVar: string = operationArray[2]; // B
        let firstVarValues: boolean[] = getValuesAllCases(firstVar, allCases);
        let secondVarValues: boolean[] = getValuesAllCases(secondVar, allCases);

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
        allCases.push(actual);
    }
    console.log(allCases);
    return allCases;
}


/**
 * Returns the array containing separately the variables and operator from operation.
 * @param {string[]} operation - String with operation.
 * @returns {string[]} An array containing each value separately.
 */
function splitOperation(operation: string): string[] {
    let operationArray: string[] = [];
    let actualToSplit: string = '';
    let isOpenParentheses: boolean = false;
    // To split values
    for (let i = 0; i < operation.length; i++) {
        if (operation[i] === '(') {
            isOpenParentheses = true;
        }
        if (operation[i] === ')') {
            isOpenParentheses = false;
        }

        actualToSplit += operation[i];

        if (operation[i] === '!' || isOpenParentheses === true) {
            continue;
        }
        operationArray.push(actualToSplit);
        actualToSplit = '';
    }
    return operationArray;
}


/**
 * Returns the boolean values of the given variable.
 * @param {string} variable 
 * @param {[string, boolean[]][]} allCases 
 * @returns {boolean[]} An array of boolean values for the given variable.
 */
function getValuesAllCases(variable: string, allCases: [string, boolean[]][]): boolean[] {
    let index: number = 0;
    if (variable.match(/[()]/g)) {
        variable = variable.slice(1, -1);
    }
    for (let i = 0; i < allCases.length; i++) {
        if (allCases[i][0] === variable) {
            index = i;
            break;
        }
    }
    return allCases[index][1];
}

/**
 * Remove expressions that is inside of parenthesesExp from
 * allOperations and then push them to the beggining of allOperations array.
 * @param {string[]} allOperations
 * @param {string[]} parenthesesExp
 * @returns {string[]} allOperations array, with expressions inside parenthesesExp included in the beginning
 */
function filterAllOperations(allOperations: string[], parenthesesExp: string[]): string[] {
    for (let x in parenthesesExp) {
        const index: number = allOperations.indexOf(x);
        if (index > -1) {
            allOperations.splice(index, -1);
        }
    }
    parenthesesExp = parenthesesExp.reverse();
    for (let x in parenthesesExp) {
        allOperations.unshift(x);
    }
    return allOperations;
}

filterAllOperations(allOperations, parenthesesExp);