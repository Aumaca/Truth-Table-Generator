class Expression {
    constructor(defaultExp) {
        this.defaultExp = defaultExp
            .replaceAll(" ", "")
            .replaceAll("!", "¬")
            .replaceAll("v", "∨")
            .replaceAll("|", "∨")
            .replaceAll("^", "∧")
            .replaceAll("&", "∧")
            .replaceAll("<->", "≡")
            .replaceAll("<=>", "≡")
            .replaceAll("=", "≡")
            .replaceAll("->", "⇒")
            .replaceAll("=>", "⇒")
            .replaceAll(/[A-Z]/g, (match) => match.toUpperCase());
        this.invertedExp = this.invertExpression(this.defaultExp);
        this.isValidExp = this.checkExpression();
        this.letters = this.getLetters();
        this.parenthesesExp = this.getParenthesesExp();
        this.parenthesesExpOps = this.getOpsFromParenthesesExp();
        this.andOps = this.getOps(this.invertedExp, "∧");
        this.newInvertedExp = this.surroundAndOps();
        this.orOps = this.getOps(this.newInvertedExp, "∨");
        this.conditionalOps = this.getConditionalOps();
        this.equivalenceOps = this.getEquivalenceOps();
        this.cases = this.getCases();
        this.operations = [...this.parenthesesExpOps, ...this.andOps, ...this.orOps, ...this.conditionalOps, ...this.equivalenceOps];
        this.truthTable = this.generateTruthTable();
    }
    checkExpression() {
        if (this.defaultExp.match(/[∧∨⇒≡][∧∨⇒≡]/g)) {
            return false;
        }
        if (this.defaultExp.match(/[A-Z][A-Z]/g)) {
            return false;
        }
        if (this.defaultExp.match(/[A-Z][¬]/g)) {
            return false;
        }
        if (!this.defaultExp.match(/[A-Z]/g)) {
            return false;
        }
        if (this.defaultExp.match(/[^A-Z∧∨⇒≡¬()]/g)) {
            return false;
        }
        if (this.defaultExp[0].match(/[∧∨⇒≡]/g) || this.defaultExp[this.defaultExp.length - 1].match(/[∧∨⇒≡]/g)) {
            return false;
        }
        let openParentheses = 0;
        this.defaultExp.split("").map((char) => {
            char === "(" ? openParentheses++ : "";
            char === ")" ? openParentheses-- : "";
        });
        if (openParentheses !== 0) {
            return false;
        }
        ;
        return true;
    }
    getCases() {
        let onlyLetters = 0;
        this.letters.map((letter) => {
            letter[0] !== "¬" ? onlyLetters++ : "";
        });
        return onlyLetters;
    }
    invertExpression(defaultExp) {
        let actualExp = "";
        let invertedExp = [];
        let openParentheses = 0;
        for (let i = 0; i < defaultExp.length; i++) {
            actualExp += defaultExp[i];
            if (defaultExp[i] === "(") {
                openParentheses++;
                continue;
            }
            if (defaultExp[i] === ")") {
                openParentheses--;
            }
            if (["¬"].includes(defaultExp[i])) {
                continue;
            }
            if (openParentheses === 0) {
                invertedExp.push(actualExp);
                actualExp = "";
            }
        }
        return invertedExp.reverse().join("");
    }
    splitOp(operation) {
        let operationArray = [];
        let actualOp = "";
        let openParentheses = 0;
        for (let i = 0; i < operation.length; i++) {
            operation[i] === "(" ? openParentheses++ : "";
            operation[i] === ")" ? openParentheses-- : "";
            actualOp += operation[i];
            if (["¬"].includes(operation[i]) || openParentheses > 0) {
                continue;
            }
            operationArray.push(actualOp);
            actualOp = "";
        }
        return operationArray;
    }
    getLetters() {
        let letters = [];
        let notLetters = [];
        for (let i = 0; i < this.defaultExp.length; i++) {
            if (this.defaultExp[i].match(/[A-Z]/)) {
                if (!letters.includes(this.defaultExp[i])) {
                    letters.push(this.defaultExp[i]);
                }
                if (this.defaultExp[i - 1] === "¬") {
                    notLetters.push(this.defaultExp[i]);
                }
            }
        }
        letters = letters.sort();
        notLetters = notLetters.sort().map((x) => { return "¬" + x; });
        return [...letters, ...notLetters];
    }
    getParenthesesExp() {
        let openParenthesesIndexs = [];
        this.defaultExp.split("").map((x, i) => {
            x === "(" ? openParenthesesIndexs.push(i) : "";
        });
        let parenthesesExp = [];
        openParenthesesIndexs.map((index) => {
            let actualExp = "";
            let openParentheses = 0;
            for (let i = index + 1;; i++) {
                this.defaultExp[i] === "(" ? openParentheses++ : '';
                this.defaultExp[i] === ")" ? openParentheses-- : '';
                if (openParentheses < 0) {
                    parenthesesExp.push(actualExp);
                    break;
                }
                actualExp += this.defaultExp[i];
            }
        });
        return parenthesesExp;
    }
    getOpsFromParenthesesExp() {
        let allOps = [];
        this.parenthesesExp.map((exp) => {
            let expOps = new Expression(exp).operations;
            expOps.map((exp) => { !allOps.includes(exp) ? allOps.push(exp) : ""; });
        });
        return allOps;
    }
    getOps(exp, operator) {
        var _a, _b;
        let operations = [];
        let opToGetPrevious = [];
        let actualOp = "";
        let openParentheses = 0;
        let toPush = false;
        let pushed = false;
        for (let i = 0; i < exp.length; i++) {
            actualOp += exp[i];
            exp[i] === "(" ? openParentheses++ : '';
            exp[i] === ")" ? openParentheses-- : '';
            if (exp[i] === "¬" || openParentheses > 0) {
                continue;
            }
            if (actualOp[0].match(/[∨∧]/g) && actualOp[1]) {
                toPush = true;
            }
            if (((_a = exp[i - 2]) === null || _a === void 0 ? void 0 : _a.match(/[∨∧]/g)) && exp[i - 1] === "¬" && ((_b = exp[i]) === null || _b === void 0 ? void 0 : _b.match(/[A-Z]/g))) {
                toPush = true;
            }
            if (this.splitOp(actualOp).length === 3) {
                toPush = true;
            }
            if (toPush === true) {
                let [firstVar, actualOperator, secondVar] = this.splitOp(actualOp);
                if (actualOperator === operator) {
                    if (firstVar[0] === "(" && firstVar[firstVar.length - 1] === ")" && !this.parenthesesExp.includes(firstVar.slice(1, -1))) {
                        firstVar = firstVar.slice(1, -1);
                    }
                    if (secondVar[0] === "(" && secondVar[secondVar.length - 1] === ")" && !this.parenthesesExp.includes(secondVar.slice(1, -1))) {
                        secondVar = secondVar.slice(1, -1);
                    }
                    operations.push(this.invertExpression(actualOp));
                    actualOp = secondVar + actualOperator + firstVar;
                    opToGetPrevious.push(actualOp);
                    pushed = true;
                }
                else {
                    actualOp = this.splitOp(actualOp)[2];
                    pushed = false;
                }
                if (pushed) {
                    actualOp = "(" + opToGetPrevious[opToGetPrevious.length - 1] + ")";
                }
                toPush = false;
            }
        }
        return operations;
    }
    surroundAndOps() {
        let newExp = this.defaultExp.split("");
        if (newExp[0] === "(" && newExp[newExp.length - 1] === ")") {
            return this.defaultExp;
        }
        let orderedAndOps = this.andOps.reverse();
        let charsToSkip = 0;
        for (let i = 0; i < orderedAndOps.length; i++) {
            const beginIndex = this.defaultExp.indexOf(orderedAndOps[i]) + charsToSkip;
            const endIndex = orderedAndOps[i].length + beginIndex + 1;
            newExp.splice(beginIndex, 0, "(");
            newExp.splice(endIndex, 0, ")");
            charsToSkip += 2;
        }
        return this.invertExpression(newExp.join(""));
    }
    getConditionalOps() {
        let newExp = this.defaultExp.split("");
        let conditionals = [];
        let condIndexs = [];
        let expsToUse = [];
        if (this.defaultExp.includes("≡")) {
            this.defaultExp.split("≡").map((exp) => {
                let openParentheses = 0;
                exp.split("").map((char) => {
                    char === "(" ? openParentheses++ : "";
                    char === ")" ? openParentheses-- : "";
                });
                if (openParentheses === 0) {
                    expsToUse.push(exp);
                }
            });
        }
        if (expsToUse.length > 0) {
            expsToUse.map((exp) => {
                let condOps = new Expression(exp).conditionalOps;
                condOps.map((op) => {
                    conditionals.push(op);
                });
            });
            return conditionals;
        }
        let openParentheses = 0;
        for (let i = 0; i < newExp.length; i++) {
            newExp[i] === "(" ? openParentheses++ : "";
            newExp[i] === ")" ? openParentheses-- : "";
            if (newExp[i] === "⇒" && openParentheses === 0) {
                condIndexs.push(i);
            }
        }
        let cuttedOpLength = 0;
        for (let i = 0; i < condIndexs.length; i++) {
            let actualCondIndex = condIndexs[i] - cuttedOpLength;
            let leftOp = newExp.slice(0, actualCondIndex).join("");
            let rightOp = newExp.slice(actualCondIndex + 1).join("");
            leftOp[0] === "(" && leftOp[leftOp.length - 1] === ")" ? leftOp = leftOp.slice(1, -1) : "";
            rightOp[0] === "(" && rightOp[rightOp.length - 1] === ")" ? rightOp = rightOp.slice(1, -1) : "";
            cuttedOpLength += leftOp.length + 1;
            let actual = `(${leftOp})⇒(${rightOp})`;
            conditionals.unshift(actual);
            newExp = newExp.slice(actualCondIndex + 1);
        }
        return conditionals;
    }
    getEquivalenceOps() {
        let newExp = this.defaultExp.split("");
        let equivalenceOps = [];
        let operatorIndexs = [];
        let openParentheses = 0;
        newExp.map((x, i) => {
            x === "(" ? openParentheses++ : "";
            x === ")" ? openParentheses-- : "";
            x === "≡" && openParentheses === 0 ? operatorIndexs.push(i) : "";
        });
        let cuttedOpLength = 0;
        for (let i = 0; i < operatorIndexs.length; i++) {
            let actualEqOp = operatorIndexs[i] - cuttedOpLength;
            let leftOp = newExp.slice(0, actualEqOp).join("");
            let rightOp = newExp.slice(actualEqOp + 1).join("");
            leftOp[0] === "(" && leftOp[leftOp.length - 1] === ")" ? leftOp = leftOp.slice(1, -1) : "";
            rightOp[0] === "(" && rightOp[rightOp.length - 1] === ")" ? rightOp = rightOp.slice(1, -1) : "";
            cuttedOpLength += leftOp.length + 1;
            let actual = `(${leftOp})≡(${rightOp})`;
            equivalenceOps.unshift(actual);
            newExp = rightOp.split("");
        }
        return equivalenceOps;
    }
    generateTruthTable() {
        let truthTable = [];
        let onlyLetters = 0;
        this.letters.map((letter) => {
            letter[0] !== "¬" ? onlyLetters++ : "";
        });
        const cases = Math.pow(2, onlyLetters);
        for (let i = 0; i < this.letters.length; i++) {
            const letter = this.letters[i];
            let actual = [letter, []];
            if (letter[0] === "¬") {
                let letterValues = [];
                truthTable.map((array) => {
                    if (array[0] === letter[1]) {
                        letterValues = array[1];
                    }
                });
                letterValues.map((boolValue) => {
                    if (boolValue === true) {
                        actual[1].push(false);
                    }
                    else {
                        actual[1].push(true);
                    }
                });
                truthTable.push(actual);
                continue;
            }
            if (i === 0) {
                for (let i = 0; i < cases; i++) {
                    if (i % 2 === 0) {
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
                for (let i = 0; i < cases; i++) {
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
        ;
        for (let i = 0; i < this.operations.length; i++) {
            let [firstVar, operator, secondVar] = this.splitOp(this.operations[i]);
            firstVar = firstVar.replaceAll("(", "").replaceAll(")", "");
            secondVar = secondVar.replaceAll("(", "").replaceAll(")", "");
            let actual = [firstVar + operator + secondVar, []];
            let firstVarValues = [];
            let secondVarValues = [];
            truthTable.map((array) => {
                if (array[0] === firstVar) {
                    firstVarValues = array[1];
                }
                if (array[0] === secondVar) {
                    secondVarValues = array[1];
                }
            });
            if (operator === "∨") {
                for (let x = 0; x < cases; x++) {
                    actual[1].push(firstVarValues[x] || secondVarValues[x]);
                }
            }
            if (operator === "∧") {
                for (let x = 0; x < cases; x++) {
                    let booleanValue = firstVarValues[x] && secondVarValues[x];
                    actual[1].push(booleanValue);
                }
            }
            if (operator === "⇒") {
                for (let x = 0; x < cases; x++) {
                    if (firstVarValues[x] === true && secondVarValues[x] === false) {
                        actual[1].push(false);
                    }
                    else {
                        actual[1].push(true);
                    }
                }
            }
            if (operator === "≡") {
                for (let x = 0; x < cases; x++) {
                    if ((firstVarValues[x] === true && secondVarValues[x] === true) || (firstVarValues[x] === false && secondVarValues[x] === false)) {
                        actual[1].push(true);
                    }
                    else {
                        actual[1].push(false);
                    }
                }
            }
            truthTable.push(actual);
        }
        let index = 0;
        truthTable.map((operationArray) => {
            if (operationArray[0].length > 2) {
                operationArray[0] = this.operations[index];
                index++;
            }
        });
        return truthTable;
    }
}
const expressionInput = document.getElementById("expression");
const handleSubmit = (evt) => {
    evt.preventDefault();
    run();
};
function run() {
    const expression = new Expression(expressionInput.value);
    console.log(expression);
    if (expression.isValidExp) {
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
            for (let operationArray of expression.truthTable) {
                const labelHeader = document.createElement("th");
                labelHeader.textContent = operationArray[0];
                headerRow.appendChild(labelHeader);
            }
            tableHeaderElement.appendChild(headerRow);
            table.appendChild(tableHeaderElement);
            const tableBodyElement = document.createElement("tbody");
            const cases = Math.pow(2, expression.cases);
            for (let i = 0; i < cases; i++) {
                const bodyRow = document.createElement("tr");
                for (let x of expression.truthTable) {
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
            const lastColumnBooleanValues = expression.truthTable[expression.truthTable.length - 1][1];
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
    else {
        alert("Expression is invalid.");
    }
}
const lightIcon = document.createElement('i');
lightIcon.className = 'fa-solid fa-xl fa-moon d-flex light-mode';
const darkIcon = document.createElement('i');
darkIcon.className = 'fa-solid fa-xl fa-sun d-flex dark-mode';
const lightIconTheme = "background:#F2994A;background:-webkit-linear-gradient(to right, #F2C94C, #F2994A);background:linear-gradient(to right, #F2C94C, #F2994A);";
const darkIconTheme = "background:#141E30;background:-webkit-linear-gradient(to right, #243B55, #141E30);background:linear-gradient(to right, #243B55, #141E30);";
let actualMode = "light";
const darkModeButton = document.getElementById("darkModeButton");
darkModeButton.addEventListener('click', () => {
    let child = darkModeButton.querySelector(':first-child');
    if (child.classList.value.includes("light-mode")) {
        darkModeButton.removeChild(child);
        darkModeButton.appendChild(darkIcon);
        document.body.setAttribute("style", darkIconTheme);
        actualMode = "dark";
    }
    else {
        darkModeButton.removeChild(child);
        darkModeButton.appendChild(lightIcon);
        document.body.setAttribute("style", lightIconTheme);
        actualMode = "light";
    }
});
//# sourceMappingURL=script.js.map