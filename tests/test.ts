const expression = "A v !B v A";
if (!checkExpression()) {
    throw new Error("Error");
}
const letters: string[] = takeLetters();
const notLetters: string[] = takeNotLetters();
const parenthesisExp: string[] = takeParenthesisExpressions();
const allOperations: string[] = takeOperations();
console.log("Letters: ");
console.log(letters);
console.log("Not Letters: ");
console.log(notLetters);
console.log("Expressions in Parenthesis: ");
console.log(parenthesisExp);
console.log("All operations: ");
console.log(allOperations);
createRows();



/**
 * Returns false if expression has invalid character or invalid '()'.
 */
function checkExpression(): boolean {
    const expWithoutSpace: string[] = (expression.replace(/\s/g, '')).split('');
    const openParenthesis: number = Array.from(expression).filter(value => value == '(').length;
    const closeParenthesis: number = Array.from(expression).filter(value => value == ')').length;
    if (openParenthesis !== closeParenthesis) {
        return false;
    }
    /**
     * if (!expression.match(/^[A-Zv^!()=><]|xor|->|=>$/g)) {
        return false;
        }
     */
    for (let i = 0; i < expWithoutSpace.length; i++) {
        // If there's 2 logical operators in sequence (v^ or ^v or vv)
        if (expWithoutSpace[i].match(/[v^]/g) && expWithoutSpace[i + 1] && expWithoutSpace[i + 1].match(/[v^]/g)) {
            return false;
        }

        // If there's 2 variables in sequence (AB v B)
        if (expWithoutSpace[i].match(/[A-Z]/g) && expWithoutSpace[i + 1] && expWithoutSpace[i + 1].match(/[A-Z]/g)) {
            return false;
        }

        // If there is an opening and closing parenthesis after (A v ())
        if (expWithoutSpace[i] === '(' && expWithoutSpace[i + 1] && expWithoutSpace[i + 1] === ')') {
            return false;
        }
    }
    return true;
}

/**
 * Returns array with unique alphabets characters in found order.
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
 * Returns array with unique alphabets characters with "!" in found order.
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

function takeIndexs(char: string): number[] {
    let indexs: number[] = [];
    for (let i = 0; i < expression.length; i++) {
        expression[i] === char ? indexs.push(i) : '';
    }
    return indexs;
}

function takeParenthesisExpressions() {
    const openParenthesisIndexs: number[] = takeIndexs('(').reverse();
    let parenthesisExpressions: string[] = [];
    let actualParenthesis: string = '';
    let actualNotParenthesis: string = '';

    for (let x of openParenthesisIndexs) {
        for (let i = x; ; i++) {
            if (expression[i - 1] === '!' && expression[i] === '(') {
                actualNotParenthesis += "!";
            }
            if (actualNotParenthesis.length > 0) {
                actualNotParenthesis += expression[i];
            }
            actualParenthesis += expression[i];
            if (expression[i] === ')') {
                parenthesisExpressions.push(actualParenthesis);
                actualParenthesis = "";
                if (actualNotParenthesis.length > 0) {
                    parenthesisExpressions.push(actualNotParenthesis);
                    actualNotParenthesis = "";
                }
                break;
            }
        }
    }
    return parenthesisExpressions;
}

function takeOperations() {
    const expWithoutSpace: string[] = expression.split(' ');
    let allOperations: string[] = [];
    let actual: string = '';
    for (let i = 0; i < expWithoutSpace.length; i++) {
        // If actual is empty and the first element to be pushed is a logic operator,
        // then push to actual the previous variable (if this not contain parenthesis)
        if (expWithoutSpace[i].match(/[v^]/g) && !expWithoutSpace[i - 1].match(/[()]/g) && actual.length === 0) {
            actual += expWithoutSpace[i - 1];
        }

        actual += expWithoutSpace[i];

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


function createRows() {
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
            let boolValue = allCases[letterIndex][1][i];
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
        let firstVar: string = operationArray[0]; // A
        console.log('firstvar: ' + firstVar);
        let operator: string = operationArray[1]; // v
        console.log('operator: ' + operator);
        let secondVar: string = operationArray[2]; // B
        console.log('secondVar: ' + secondVar);
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
 * 
 * @param string - String with operation
 * @returns An array containing each value separately
 */
function splitOperation(operation: string): string[] {
    let operationArray: string[] = [];
    let actualToSplit: string = '';
    // To split values
    for (let i = 0; i < operation.length; i++) {
        actualToSplit += operation[i];
        if (operation[i] === '!') {
            continue;
        }
        operationArray.push(actualToSplit);
        actualToSplit = '';
    }
    return operationArray;
}

function getValuesAllCases(variable: string, allCases: [string, boolean[]][]): boolean[] {
    let index: number = 0;
    for (let i = 0; i < allCases.length; i++) {
        if (allCases[i][0] === variable) {
            index = i;
            break;
        }
    }
    return allCases[index][1];
}