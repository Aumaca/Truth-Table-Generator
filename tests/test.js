const expression = "A v !B v A";
if (!checkExpression()) {
    throw new Error("Error");
}
const letters = takeLetters();
const notLetters = takeNotLetters();
const parenthesisExp = takeParenthesisExpressions();
const allOperations = takeOperations();
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
function checkExpression() {
    const expWithoutSpace = (expression.replace(/\s/g, '')).split('');
    const openParenthesis = Array.from(expression).filter(value => value == '(').length;
    const closeParenthesis = Array.from(expression).filter(value => value == ')').length;
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
function takeLetters() {
    let letters = [];
    for (let i = 0; i < expression.length; i++) {
        if (expression[i].match(/[A-Z]/)) {
            if (!letters.includes(expression[i]) && !expression[i].match(/[v^]/g)) {
                letters.push(expression[i]);
            }
        }
    }
    return letters;
}
;
/**
 * Returns array with unique alphabets characters with "!" in found order.
 */
function takeNotLetters() {
    let notLetters = [];
    for (let i = 0; i < expression.length; i++) {
        if (expression[i] === "!" && expression[i + 1] && expression[i + 1].match(/[A-Z]/)) {
            let actual = '';
            actual += expression[i];
            actual += expression[i + 1];
            if (!notLetters.includes(actual)) {
                notLetters.push(actual);
            }
        }
    }
    return notLetters;
}
;
function takeIndexs(char) {
    let indexs = [];
    for (let i = 0; i < expression.length; i++) {
        expression[i] === char ? indexs.push(i) : '';
    }
    return indexs;
}
function takeParenthesisExpressions() {
    const openParenthesisIndexs = takeIndexs('(').reverse();
    let parenthesisExpressions = [];
    let actualParenthesis = '';
    let actualNotParenthesis = '';
    for (let x of openParenthesisIndexs) {
        for (let i = x;; i++) {
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
    const expWithoutSpace = expression.split(' ');
    let allOperations = [];
    let actual = '';
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
function changeActualBool(actualBool) {
    if (actualBool === true) {
        return false;
    }
    return true;
}
function createRows() {
    const cases = Math.pow(2, letters.length);
    let allCases = [];
    // For each letter
    for (let i = 0; i < letters.length; i++) {
        let actual = [letters[i], []];
        // If first letter
        if (i === 0) {
            for (let x = 0; x < cases; x++) {
                if (x % 2 === 0) {
                    actual[1].push(true);
                }
                else {
                    actual[1].push(false);
                }
            }
        }
        else {
            const maxTrack = (Math.pow(2, (i + 1))) / 2;
            let actualTrack = 0;
            let actualBool = true;
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
        let actual = [notLetters[i], []]; // Set actual array to be pushed to allCases
        let letterIndex = 0; // Take first number that is index of array containing all values of the letter
        // Return the index of a letter in allCases to access his boolean values
        let letter = notLetters[i].replace('!', '');
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
        let operation = allOperations[i]; // Take operation
        let actual = [operation, []]; // Set array to the operation
        let operationArray = splitOperation(operation); // Split operation to get single values
        // To get values and make operation
        let firstVar = operationArray[0]; // A
        console.log('firstvar: ' + firstVar);
        let operator = operationArray[1]; // v
        console.log('operator: ' + operator);
        let secondVar = operationArray[2]; // B
        console.log('secondVar: ' + secondVar);
        let firstVarValues = getValuesAllCases(firstVar, allCases);
        let secondVarValues = getValuesAllCases(secondVar, allCases);
        // Generate conditionals results for each case and store to actual[1]
        for (let i = 0; i < cases; i++) {
            let actualValueCase = false;
            if (operator === 'v') {
                if (firstVarValues[i] || secondVarValues[i]) {
                    actualValueCase = true;
                }
                else {
                    actualValueCase = false;
                }
            }
            if (operator === '^') {
                if (firstVarValues[i] && secondVarValues[i]) {
                    actualValueCase = true;
                }
                else {
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
function splitOperation(operation) {
    let operationArray = [];
    let actualToSplit = '';
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
function getValuesAllCases(variable, allCases) {
    let index = 0;
    for (let i = 0; i < allCases.length; i++) {
        if (allCases[i][0] === variable) {
            index = i;
            break;
        }
    }
    return allCases[index][1];
}
//# sourceMappingURL=test.js.map