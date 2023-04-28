const expressionInput = document.getElementById("expression");
const handleSubmit = (evt) => {
    evt.preventDefault();
    run();
};
function run() {
    const expression = expressionInput.value.replaceAll("!", "¬");
    const expressionNoSpace = expression.split(" ").join("");
    const invertedExpressionNoSpace = invertExpression(expressionNoSpace);
    if (!checkExpression()) {
        const truthTableDiv = document.getElementById("truth-table");
        truthTableDiv.textContent = "";
        alert("Error. The expression is invalid.");
        throw new Error("Error. The expression is invalid.");
    }
    const letters = takeLetters();
    const notLetters = takeNotLetters();
    const parenthesesExp = takeParenthesesExpressions(expressionNoSpace);
    const notParenthesesExp = parenthesesExp.filter(exp => exp[0] === "¬");
    const allOperations = takeOperations(invertedExpressionNoSpace);
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
    console.log("truthTable: ");
    console.log(truthTable);
    function checkExpression() {
        const openParentheses = Array.from(expression).filter(value => value == '(').length;
        const closeParentheses = Array.from(expression).filter(value => value == ')').length;
        if (openParentheses !== closeParentheses) {
            return false;
        }
        for (let i = 0; i < expressionNoSpace.length; i++) {
            if (expressionNoSpace[i].match(/[v^]/g) && expressionNoSpace[i + 1] && expressionNoSpace[i + 1].match(/[v^]/g)) {
                return false;
            }
            if (expressionNoSpace[i].match(/[A-Z]/g) && expressionNoSpace[i + 1] && expressionNoSpace[i + 1].match(/[A-Z]/g)) {
                return false;
            }
            if (expressionNoSpace[i] === '(' && expressionNoSpace[i + 1] && expressionNoSpace[i + 1] === ')') {
                return false;
            }
        }
        return true;
    }
    function invertExpression(expression) {
        let actual = "";
        let inverseExpression = [];
        let openParentheses = 0;
        for (let i = 0; i < expression.length; i++) {
            actual += expression[i];
            if (expression[i] === "(") {
                openParentheses++;
                continue;
            }
            if (expression[i] === ")") {
                openParentheses--;
            }
            if (["¬", "-", ">"].includes(expression[i]) || expression[i + 1] === "-") {
                continue;
            }
            if (openParentheses === 0) {
                inverseExpression.push(actual);
                actual = "";
            }
        }
        return inverseExpression.reverse().join("");
    }
    function TakeAndOperations(expression, toReturn) {
        var _a, _b;
        let newExpression = Array.from(expression);
        let andOperations = [];
        let actual = "";
        let openParentheses = 0;
        let toPush = false;
        for (let i = 0; i < expression.length; i++) {
            actual += expression[i];
            expression[i] === "(" ? openParentheses++ : '';
            expression[i] === ")" ? openParentheses-- : '';
            if (expression[i] === "¬" || openParentheses > 0) {
                continue;
            }
            if (actual[0].match(/[v^]/g) && actual[1]) {
                toPush = true;
            }
            if (((_a = expression[i - 2]) === null || _a === void 0 ? void 0 : _a.match(/[v^]/g)) && expression[i - 1] === "¬" && ((_b = expression[i]) === null || _b === void 0 ? void 0 : _b.match(/[A-Z]/g))) {
                toPush = true;
            }
            if (splitOperation(actual).length === 3) {
                toPush = true;
            }
            if (toPush === true) {
                const operations = splitOperation(actual);
                if (operations[1] === "^") {
                    andOperations.push(actual);
                    actual = "";
                }
                else {
                    actual = operations[operations.length - 1];
                }
                toPush = false;
            }
        }
        let charsToSkip = 0;
        for (let i = 0; i < andOperations.length; i++) {
            const beginIndex = expression.indexOf(andOperations[i]) + charsToSkip;
            const endIndex = andOperations[i].length + beginIndex + 1;
            newExpression.splice(beginIndex, 0, "(");
            newExpression.splice(endIndex, 0, ")");
            newExpression = newExpression.join("").replace(andOperations[i], invertExpression(andOperations[i])).split("");
            charsToSkip += 2;
        }
        if (toReturn === "newExpression") {
            return newExpression;
        }
        if (toReturn === "operations") {
            return andOperations;
        }
    }
    function takeLetters() {
        let letters = [];
        for (let i = 0; i < expressionNoSpace.length; i++) {
            if (expressionNoSpace[i].match(/[A-Z]/)) {
                if (!letters.includes(expressionNoSpace[i]) && !expressionNoSpace[i].match(/[v^]/g)) {
                    letters.push(expressionNoSpace[i]);
                }
            }
        }
        letters = letters.sort();
        return letters;
    }
    ;
    function takeNotLetters() {
        let notLetters = [];
        for (let i = 0; i < expressionNoSpace.length; i++) {
            if (expressionNoSpace[i] === "¬" && expressionNoSpace[i + 1] && expressionNoSpace[i + 1].match(/[A-Z]/)) {
                if (!notLetters.includes(expressionNoSpace[i + 1])) {
                    notLetters.push(expressionNoSpace[i + 1]);
                }
            }
        }
        notLetters = notLetters.sort().map((letter) => {
            return "¬" + letter;
        });
        return notLetters;
    }
    ;
    function takeIndexs(char, expressionNoSpace) {
        let indexs = [];
        for (let i = 0; i < expressionNoSpace.length; i++) {
            expressionNoSpace[i] === char ? indexs.push(i) : '';
        }
        return indexs;
    }
    function takeParenthesesExpressions(expressionNoSpace) {
        const openParenthesesIndexs = takeIndexs('(', expressionNoSpace.split("")).reverse();
        let parenthesesExpressions = [];
        for (let x of openParenthesesIndexs) {
            let actual = '';
            let openParentheses = 0;
            for (let i = x;; i++) {
                if (expressionNoSpace[i - 1] === "¬" && expressionNoSpace[i] === '(' && i === x) {
                    actual += "¬";
                }
                actual += expressionNoSpace[i];
                expressionNoSpace[i] === "(" ? openParentheses++ : '';
                expressionNoSpace[i] === ")" ? openParentheses-- : '';
                if (expressionNoSpace[i] === ')' && openParentheses === 0) {
                    parenthesesExpressions.push(actual);
                    break;
                }
            }
        }
        return parenthesesExpressions;
    }
    function takeOperations(expression) {
        var _a, _b;
        let allOperations = [];
        let actual = "";
        let openParentheses = 0;
        let toPush = false;
        let newExpression = TakeAndOperations(expression, "newExpression");
        let andOperations = TakeAndOperations(expression, "operations");
        andOperations.map((operation) => {
            allOperations.push(invertExpression(operation));
        });
        for (let i = 0; i < newExpression.length; i++) {
            actual += newExpression[i];
            newExpression[i] === "(" ? openParentheses++ : '';
            newExpression[i] === ")" ? openParentheses-- : '';
            if (newExpression[i] === "¬" || openParentheses > 0) {
                continue;
            }
            if (actual[0].match(/[v^]/g) && actual[1]) {
                toPush = true;
            }
            if (((_a = newExpression[i - 2]) === null || _a === void 0 ? void 0 : _a.match(/[v^]/g)) && newExpression[i - 1] === "¬" && ((_b = newExpression[i]) === null || _b === void 0 ? void 0 : _b.match(/[A-Z]/g))) {
                toPush = true;
            }
            if (splitOperation(actual).length === 3) {
                toPush = true;
            }
            if (toPush === true) {
                if (actual[0].match(/[v^]/g)) {
                    let operator = actual[0];
                    let newActual = actual.slice(actual.indexOf(operator) + 1);
                    actual = newActual + operator;
                }
                else {
                    const operations = splitOperation(actual);
                    actual = operations[2] + operations[1] + operations[0];
                }
                allOperations.push(actual);
                toPush = false;
                actual = "";
            }
        }
        return allOperations;
    }
    function createRows() {
        const cases = Math.pow(2, letters.length);
        let truthTable = [];
        for (let i = 0; i < letters.length; i++) {
            let actual = [letters[i], []];
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
        for (let i = 0; i < notLetters.length; i++) {
            let actual = [notLetters[i], []];
            let letterIndex = 0;
            let letter = notLetters[i].replace("¬", "");
            for (let i = 0; i < truthTable.length; i++) {
                if (truthTable[i][0] === letter) {
                    letterIndex = i;
                    break;
                }
            }
            for (let i = 0; i < cases; i++) {
                let boolValue = truthTable[letterIndex][1][i];
                boolValue === true ? actual[1].push(false) : actual[1].push(true);
            }
            truthTable.push(actual);
        }
        for (let i = 0; i < parenthesesExp.length; i++) {
            let actualExp = parenthesesExp[i];
            if (actualExp[0] === "¬") {
                actualExp = actualExp.slice(1);
            }
            actualExp = actualExp.slice(1, -1);
            const actualExpInverted = invertExpression(actualExp);
            const operations = takeOperations(actualExpInverted);
            for (let x of operations) {
                addVariableToTruthTable(x);
            }
            if (parenthesesExp[i][0] === "¬") {
                let actual = [parenthesesExp[i], []];
                for (let i = 0; i < cases; i++) {
                    let boolValue = truthTable[truthTable.length - 1][1][i];
                    boolValue === true ? actual[1].push(false) : actual[1].push(true);
                }
                truthTable.push(actual);
            }
        }
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
        return truthTable;
        function addVariableToTruthTable(operation) {
            if (operation[operation.length - 1].match(/[v^]/g)) {
                operation = operation + "(" + truthTable[truthTable.length - 1][0] + ")";
            }
            let operationArray = splitOperation(operation);
            let [firstVar, operator, secondVar] = operationArray;
            let operationToDisplay = operationArray;
            if (firstVar[0] === "(" && firstVar[firstVar.length - 1] === ")") {
                if (!parenthesesExp.includes(firstVar)) {
                    operationToDisplay[0] = firstVar.slice(1, -1);
                }
            }
            if (secondVar[0] === "(" && secondVar[secondVar.length - 1] === ")") {
                if (!parenthesesExp.includes(secondVar)) {
                    operationToDisplay[2] = secondVar.slice(1, -1);
                }
            }
            let actual = [operationToDisplay.join(""), []];
            let firstVarValues = getValuesTruthTable(firstVar, truthTable);
            let secondVarValues = getValuesTruthTable(secondVar, truthTable);
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
    function splitOperation(operation) {
        let operationArray = [];
        let actual = "";
        let openParentheses = 0;
        for (let i = 0; i < operation.length; i++) {
            operation[i] === "(" ? openParentheses++ : "";
            operation[i] === ")" ? openParentheses-- : "";
            actual += operation[i];
            if (operation[i] === "¬" || openParentheses > 0) {
                continue;
            }
            operationArray.push(actual);
            actual = "";
        }
        return operationArray;
    }
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
    const truthTableDiv = document.getElementById("truth-table");
    const truthTableCategoryDiv = document.getElementById("truth-table-category");
    if (truthTableDiv) {
        truthTableDiv.children ? truthTableDiv.textContent = "" : "";
        truthTableCategoryDiv.children ? truthTableCategoryDiv.textContent = "" : "";
        const table = document.createElement("table");
        table.id = "the-table";
        table.style.opacity = '0';
        const tableHeaderElement = document.createElement("thead");
        const headerRow = document.createElement("tr");
        for (let x of truthTable) {
            const labelHeader = document.createElement("th");
            labelHeader.textContent = x[0];
            headerRow.appendChild(labelHeader);
        }
        tableHeaderElement.appendChild(headerRow);
        table.appendChild(tableHeaderElement);
        const tableBodyElement = document.createElement("tbody");
        const cases = Math.pow(2, letters.length);
        for (let i = 0; i < cases; i++) {
            const bodyRow = document.createElement("tr");
            for (let x of truthTable) {
                const actualBooleanCell = document.createElement("td");
                actualBooleanCell.textContent = (new Boolean(x[1][i]).toString()[0]).toUpperCase();
                if (x[1][i]) {
                    actualBooleanCell.className = "true";
                }
                else {
                    actualBooleanCell.className = "false";
                }
                bodyRow.appendChild(actualBooleanCell);
            }
            tableBodyElement.appendChild(bodyRow);
        }
        table.appendChild(tableBodyElement);
        truthTableDiv.appendChild(table);
        const paragraph = document.createElement("h4");
        const lastColumnBooleanValues = truthTable[truthTable.length - 1][1];
        if (lastColumnBooleanValues.every((bool) => bool === true)) {
            paragraph.textContent = "Tautology";
            paragraph.className = "tautology";
        }
        else {
            if (lastColumnBooleanValues.every((bool) => bool === false)) {
                paragraph.textContent = "Contradiction";
                paragraph.className = "contradiction";
            }
            else {
                paragraph.textContent = "Contingency";
                paragraph.className = "contingency";
            }
        }
        truthTableCategoryDiv.appendChild(paragraph);
        setTimeout(() => {
            table.style.opacity = "1";
            truthTableCategoryDiv.style.opacity = "1";
        }, 100);
    }
}
//# sourceMappingURL=script.js.map