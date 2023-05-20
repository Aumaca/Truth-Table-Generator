class Expression {
    constructor(defaultExp) {
        this.defaultExp = defaultExp.replaceAll("!", "¬");
        this.invertedExp = this.invertExpression(this.defaultExp);
        this.letters = this.getLetters();
        this.parenthesesExp = this.getParenthesesExp();
        this.parenthesesExpOps = this.getOpsFromParenthesesExp();
        this.andOps = this.getOps(this.invertedExp, "^");
        this.newInvertedExp = this.surroundAndOps();
        this.orOps = this.getOps(this.newInvertedExp, "v");
        this.conditionalOps = this.getConditionalOps();
        this.operations = [...this.parenthesesExpOps, ...this.andOps, ...this.orOps, ...this.conditionalOps];
        this.truthTable = this.generateTruthTable();
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
            if (["¬", "-"].includes(defaultExp[i])) {
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
            if (["¬", "<", "-"].includes(operation[i]) || openParentheses > 0) {
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
            if (actualOp[0].match(/[v^]/g) && actualOp[1]) {
                toPush = true;
            }
            if (((_a = exp[i - 2]) === null || _a === void 0 ? void 0 : _a.match(/[v^]/g)) && exp[i - 1] === "¬" && ((_b = exp[i]) === null || _b === void 0 ? void 0 : _b.match(/[A-Z]/g))) {
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
        let openParentheses = 0;
        newExp.map((x, i) => {
            x === "(" ? openParentheses++ : "";
            x === ")" ? openParentheses-- : "";
            x === ">" && openParentheses === 0 ? condIndexs.push(i) : "";
        });
        let cuttedOpLength = 0;
        for (let i = 0; i < condIndexs.length; i++) {
            let actualCondIndex = condIndexs[i] - cuttedOpLength;
            const leftOp = newExp.slice(0, actualCondIndex - 1).join("");
            const rightOp = newExp.slice(actualCondIndex + 1).join("");
            cuttedOpLength += leftOp.length + 2;
            let actual = `(${leftOp})->(${rightOp})`;
            conditionals.unshift(actual);
            newExp = newExp.slice(actualCondIndex + 1);
        }
        return conditionals;
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
            let actual = [this.operations[i], []];
            let [firstVar, operator, secondVar] = this.splitOp(this.operations[i]);
            firstVar[0] === "(" && firstVar[firstVar.length - 1] === ")" ? firstVar = firstVar.slice(1, -1) : "";
            secondVar[0] === "(" && secondVar[secondVar.length - 1] === ")" ? secondVar = secondVar.slice(1, -1) : "";
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
            if (operator === "v") {
                for (let x = 0; x < cases; x++) {
                    actual[1].push(firstVarValues[x] || secondVarValues[x]);
                }
            }
            if (operator === "^") {
                for (let x = 0; x < cases; x++) {
                    let booleanValue = firstVarValues[x] && secondVarValues[x];
                    actual[1].push(booleanValue);
                }
            }
            if (operator === "->") {
                for (let x = 0; x < cases; x++) {
                    if (firstVarValues[x] === true && secondVarValues[x] === false) {
                        actual[1].push(false);
                    }
                    else {
                        actual[1].push(false);
                    }
                }
            }
            truthTable.push(actual);
        }
        return truthTable;
    }
}
let exp = new Expression("A^B->¬Cv!A");
console.log(exp.truthTable[0]);
//# sourceMappingURL=test.js.map