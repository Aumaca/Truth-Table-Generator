class Expression {
    constructor(defaultExp) {
        this.defaultExp = defaultExp.replaceAll("!", "¬").replaceAll("v", "∨").replaceAll("^", "∧").replaceAll("<->", "≡").replaceAll("<=>", "≡").replaceAll("=", "≡").replaceAll("->", "⇒").replaceAll("=>", "⇒");
        this.invertedExp = this.invertExpression(this.defaultExp);
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
            x === "(" ? openParenthesesIndexs.unshift(i) : "";
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
        let orderedAndOps = this.andOps.reverse();
        let charsToSkip = 0;
        for (let i = 0; i < orderedAndOps.length; i++) {
            const beginIndex = this.defaultExp.indexOf(orderedAndOps[i]) + charsToSkip;
            const endIndex = orderedAndOps[i].length + beginIndex + 1;
            newExp.splice(beginIndex, 0, "(");
            newExp.splice(endIndex, 0, ")");
            charsToSkip += 2;
        }
        if (newExp[0] === "(" && newExp[newExp.length - 1] === ")") {
            return this.defaultExp;
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
                for (let i = 0; i < this.cases; i++) {
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
                for (let i = 0; i < this.cases; i++) {
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
            firstVar[0] === "(" && firstVar[firstVar.length - 1] === ")" ? firstVar = firstVar.slice(1, -1) : "";
            secondVar[0] === "(" && secondVar[secondVar.length - 1] === ")" ? secondVar = secondVar.slice(1, -1) : "";
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
                for (let x = 0; x < this.cases; x++) {
                    actual[1].push(firstVarValues[x] || secondVarValues[x]);
                }
            }
            if (operator === "∧") {
                for (let x = 0; x < this.cases; x++) {
                    let booleanValue = firstVarValues[x] && secondVarValues[x];
                    actual[1].push(booleanValue);
                }
            }
            if (operator === "⇒") {
                for (let x = 0; x < this.cases; x++) {
                    if (firstVarValues[x] === true && secondVarValues[x] === false) {
                        actual[1].push(false);
                    }
                    else {
                        actual[1].push(true);
                    }
                }
            }
            if (operator === "≡") {
                for (let x = 0; x < this.cases; x++) {
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
let exp = new Expression("A^B->!B<->!A<->B");
//# sourceMappingURL=test.js.map