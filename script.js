const expressionInput = document.getElementById("expression");
const handleSubmit = (evt) => {
    evt.preventDefault();
    run();
};
function run() {
    const div = document.getElementsByClassName("truth-table");
    const expression = expressionInput.value;
    const expressionNoSpace = expression.split(" ").join("").split("");
    if (!checkExpression()) {
        throw new Error("Error. The expression is invalid.");
    }
    const letters = takeLetters();
    const notLetters = takeNotLetters();
    const parenthesesExp = takeParenthesesExpressions();
    const notParenthesesExp = parenthesesExp.filter(exp => exp[0] === "!");
    const allOperations = takeOperations();
    console.log("Letters: ");
    console.log(letters);
    console.log("Not Letters: ");
    console.log(notLetters);
    console.log("Expressions in Parentheses: ");
    console.log(parenthesesExp);
    console.log("Not Expressions in Parentheses: ");
    console.log(notParenthesesExp);
    console.log("All operations: ");
    console.log(allOperations);
    const truthTable = createRows();
    function checkExpression() {
        const openParentheses = Array.from(expression).filter(value => value == '(').length;
        const closeParentheses = Array.from(expression).filter(value => value == ')').length;
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
    */
    function takeLetters() {
        let letters = [];
        for (let i = 0; i < expressionNoSpace.length; i++) {
            if (expressionNoSpace[i].match(/[A-Z]/)) {
                if (!letters.includes(expressionNoSpace[i]) && !expressionNoSpace[i].match(/[v^]/g)) {
                    letters.push(expressionNoSpace[i]);
                }
            }
        }
        return letters;
    }
    ;
    /**
     * Returns array of unique variables with "!" before (negation).
     */
    function takeNotLetters() {
        let notLetters = [];
        for (let i = 0; i < expressionNoSpace.length; i++) {
            if (expressionNoSpace[i] === "!" && expressionNoSpace[i + 1] && expressionNoSpace[i + 1].match(/[A-Z]/)) {
                let actual = '';
                actual += expressionNoSpace[i];
                actual += expressionNoSpace[i + 1];
                if (!notLetters.includes(actual)) {
                    notLetters.push(actual);
                }
            }
        }
        return notLetters;
    }
    ;
    /**
     * Returns indexes array of where the characters were found.
     * @param char - Character to be found.
     */
    function takeIndexs(char) {
        let indexs = [];
        for (let i = 0; i < expressionNoSpace.length; i++) {
            expressionNoSpace[i] === char ? indexs.push(i) : '';
        }
        return indexs;
    }
    /**
     * Returns expressions within parentheses, from innermost to outermost.
     */
    function takeParenthesesExpressions() {
        const openParenthesesIndexs = takeIndexs('(').reverse();
        let parenthesesExpressions = [];
        for (let x of openParenthesesIndexs) {
            let actual = '';
            let openParentheses = 0;
            for (let i = x;; i++) {
                if (expressionNoSpace[i - 1] === "!" && expressionNoSpace[i] === '(' && i === x) {
                    actual += "!";
                }
                actual += expressionNoSpace[i];
                expressionNoSpace[i] === "(" ? openParentheses++ : '';
                expressionNoSpace[i] === ")" ? openParentheses-- : '';
                if (expressionNoSpace[i] === ')' && openParentheses === 0) {
                    if (checkParenthesesExpression(actual)) {
                        parenthesesExpressions.push(actual);
                        break;
                    }
                    break;
                }
            }
        }
        return parenthesesExpressions;
    }
    /**
     * Returns array with separated operations from expression.
     */
    function takeOperations() {
        let allOperations = [];
        let actual = "";
        let openParentheses = 0;
        // Example: AvB^(AvB)
        for (let i = 0; i < expressionNoSpace.length; i++) {
            actual += expressionNoSpace[i];
            // To track parentheses
            expressionNoSpace[i] === "(" ? openParentheses++ : '';
            expressionNoSpace[i] === ")" ? openParentheses-- : '';
            // To check "!" or remaining operation
            if (expressionNoSpace[i] === "!" || (expressionNoSpace[i].match(/[v^]/g) && actual === "")) {
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
     * Create rows using arrays with the variable followed by his boolean values.
     * 1 - Create boolean values for each letter in letters.
     * 2 - Create boolean values for each letter negated in notLetters.
     * 3 - Create boolean values for each expression inside parentheses.
     * 4 - Create boolean values for each expression negated inside notParentheses.
     */
    function createRows() {
        const cases = Math.pow(2, letters.length);
        let truthTable = [];
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
                        actualBool = actualBool ? false : true;
                    }
                    actualTrack++;
                    actual[1].push(actualBool);
                }
            }
            truthTable.push(actual);
        }
        // For each notLetter
        for (let i = 0; i < notLetters.length; i++) { // For letter in notLetters
            let actual = [notLetters[i], []]; // Set actual array to be pushed to truthTable
            let letterIndex = 0; // Take first number that is index of array containing all values of the letter
            // Return the index of a letter in truthTable to access his boolean values
            let letter = notLetters[i].replace('!', '');
            for (let i = 0; i < truthTable.length; i++) {
                if (truthTable[i][0] === letter) {
                    letterIndex = i;
                    break;
                }
            }
            // For booleans values in given letter
            for (let i = 0; i < cases; i++) {
                let boolValue = truthTable[letterIndex][1][i];
                boolValue === true ? actual[1].push(false) : actual[1].push(true);
            }
            truthTable.push(actual);
        }
        // For each expression inside parentheses
        for (let i = 0; i < parenthesesExp.length; i++) {
            let actualExp = parenthesesExp[i];
            // Remove initial "!"
            if (actualExp[0] === "!") {
                actualExp = actualExp.slice(1);
            }
            addVariableToTruthTable(actualExp.slice(1, -1));
        }
        // For each expression inside parentheses that is negated 
        const notExpressions = parenthesesExp.filter(exp => exp[0] === "!"); // Filter only negations
        for (let i = 0; i < notExpressions.length; i++) {
            let actual = [notExpressions[i], []]; // Set actual array to be pushed to truthTable
            let expressionIndex = 0; // Index of expression in truthTable
            // Return the index of a expression in truthTable to access his boolean values
            let expression = notExpressions[i];
            expression = expression.replace(expression[0], "").slice(1, -1); // Remove "!" and parentheses
            for (let i = 0; i < truthTable.length; i++) {
                if (truthTable[i][0] === expression) {
                    expressionIndex = i;
                    break;
                }
            }
            // For booleans values from expression
            for (let i = 0; i < cases; i++) {
                let boolValue = truthTable[expressionIndex][1][i];
                boolValue === true ? actual[1].push(false) : actual[1].push(true);
            }
            truthTable.push(actual);
        }
        // For each operation
        for (let i = 0; i < allOperations.length; i++) {
            let operation = allOperations[i];
            if (operation[0] === "(" && operation[operation.length - 1] === ")") {
                operation = operation.slice(1, -1);
            }
            let inTruthTable = truthTable.some((element) => {
                return operation === element[0];
            });
            if (inTruthTable) {
                break;
            }
            addVariableToTruthTable(allOperations[i]);
        }
        console.log(truthTable);
        return truthTable;
        /**
         * Receive operation and then make all necessary steps to
         * make operation and set to truthTable array.
         * It's not used to process letters and notLetters.
         */
        function addVariableToTruthTable(operation) {
            let operationToDisplay = operation;
            // If first char is operator, add previous operation to string.
            if (operation[0].match(/[v^]/g)) {
                operationToDisplay = allOperations[allOperations.indexOf(operation) - 1] + operation;
                operation = `${allOperations[allOperations.indexOf(operation) - 1]}${operation}`;
            }
            let actual = [operationToDisplay, []]; // Set array to the operation
            let operationArray = splitOperation(operation); // Split expression
            const [firstVar, operator, secondVar] = operationArray; // Takes expression's elements
            let firstVarValues = getValuesTruthTable(firstVar, truthTable);
            console.log("looking for " + firstVar);
            console.log(firstVarValues);
            let secondVarValues = getValuesTruthTable(secondVar, truthTable);
            console.log("looking for " + secondVar);
            console.log(secondVarValues);
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
            truthTable.push(actual);
        }
    }
    /**
     * Returns the array containing separately the variables and operator from operation.
     */
    function splitOperation(operation) {
        let operationArray = [];
        let actual = '';
        let openParentheses = 0;
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
            console.log(actual);
            actual = '';
        }
        return operationArray;
    }
    /**
     * Returns the boolean values of the given variable.
     */
    function getValuesTruthTable(variable, truthTable) {
        let index = 0;
        if (variable[0] === "(" && variable[variable.length - 1] === ")") {
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
    /**
     * Return true if expression inside parentheses isn't only a variable
     */
    function checkParenthesesExpression(expression) {
        expression[0] === "!" ? expression = expression.replace(expression[0], "") : ""; // Remove "!" if this is the first char in expression
        const slicedOperation = splitOperation(expression.slice(1, -1)); // Remove parantheses
        if (slicedOperation.length !== 3) {
            return false;
        }
        return true;
    }
    const truthTableDiv = document.getElementById("truth-table");
    if (truthTableDiv) {
        if (truthTableDiv.children) {
            truthTableDiv.textContent = "";
        }
        const table = document.createElement("table");
        // Table's header
        const tableHeaderElement = document.createElement("thead");
        const headerRow = document.createElement("tr");
        for (let x of truthTable) {
            const labelHeader = document.createElement("th");
            labelHeader.textContent = x[0]; // Variable
            headerRow.appendChild(labelHeader);
        }
        tableHeaderElement.appendChild(headerRow);
        table.appendChild(tableHeaderElement);
        const tableBodyElement = document.createElement("tbody");
        // Table's boolean values from expressions
        const cases = Math.pow(2, letters.length);
        // Create a row for body for each case
        for (let i = 0; i < cases; i++) {
            const bodyRow = document.createElement("tr");
            // For each variable in truth table
            for (let x of truthTable) {
                const actualBooleanCell = document.createElement("td");
                actualBooleanCell.textContent = (new Boolean(x[1][i]).toString()[0]).toUpperCase();
                bodyRow.appendChild(actualBooleanCell);
            }
            tableBodyElement.appendChild(bodyRow);
        }
        table.appendChild(tableBodyElement);
        truthTableDiv.appendChild(table);
    }
}
//# sourceMappingURL=script.js.map