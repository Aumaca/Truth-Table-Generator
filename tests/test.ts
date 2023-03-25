const expression = "A v B v !A v !B";
if (!checkExpression()) {
    throw new Error("Error");
}
const letters: string[] = takeLetters();
const notLetters: string[] = takeNotLetters();
const parenthesisExp: string[] = takeParenthesisExpressions();
console.log("Letters: " + letters);
console.log("Not Letters: " + notLetters);
console.log("Expressions in Parenthesis: " + parenthesisExp);
createRows();


/**
 * Returns false if expression has invalid character or invalid '()'.
 */
function checkExpression(): boolean {
    const openParenthesis = Array.from(expression).filter(value => value == '(').length;
    const closeParenthesis = Array.from(expression).filter(value => value == '(').length;
    if (openParenthesis !== closeParenthesis) {
        return false;
    }
    if (!expression.match(/^[A-Zv^!()=><]|xor|->|=>$/g)) {
        return false;
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
            if (!letters.includes(expression[i]) && expression[i] !== 'v') {
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
        if (expression[i] === "!" && expression[i + 1].match(/[A-Z]/)) {
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
        expression[i] === '(' ? indexs.push(i) : '';
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


function changeActualBool(actualBool: boolean): boolean {
    if (actualBool === true) {
        return false;
    }
    return true;
}


function createRows() {
    const cases: number = 2 ** letters.length;
    let allCases = []; // To see about it after

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
            allCases.push(actual);
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
            allCases.push(actual);
        }
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
    console.log(allCases);
}