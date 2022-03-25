//declare constants, thse can actually be moved in a different file
const EXCEPTIONS = {
  ZERO: "Cannot divide by zero",
  INFINITY: "To Infinity and beyond!",
  ERR: "Something went wrong",
};
const COMMAND_KEY = {
  EQ: "command-eq",
  CLEAR: "command-clear",
  DELETE: "command-delete",
};
const commandMapper = {
  "enter": COMMAND_KEY.EQ,
  "delete": COMMAND_KEY.CLEAR,
};

const initCalulator = (valuesHtml, calculatorHtml) => {
  const inputEvent = new Event("input");
  let errFlag = false;
  const removeDuplicateSignRegExp = /(\+|\-|\.|\*|\/|\^){1,}/g;

  //function to handle input commands (calculate, delete one character, clear)
  const executeCommand = (command) => {
    switch (command) {
      case COMMAND_KEY.EQ:
        //remove last sign if exists
        let result = valuesHtml.value.replace(/(\+|\-|\.|\*|\/|\^)(?!\d)/gi, "");
        //remove e if not followed by a number/+/-
        result = result.replace(/e(?!\+|\-|\d)/gi, "");
        //check if we divide by zero
        if ((/\d+\/0/g).test(result)) {
          errFlag = true;
          valuesHtml.value = EXCEPTIONS.ZERO;
          return;
        }
        // convert ^ to **
        result = result.replace(/\^/g, "**");
        try {
          result = eval(result);
        } catch (err) {
          errFlag = true;
          valuesHtml.value = EXCEPTIONS.ERR;
          return;
        }

        if (result !== Infinity) {
          valuesHtml.value = result;
        } else {//something went wrong
          errFlag = true;
          valuesHtml.value = EXCEPTIONS.INFINITY;
        }
        break;

      case COMMAND_KEY.DELETE:
        if (!valuesHtml.value.length) {
          return;
        }
        if (!document.activeElement.isEqualNode(valuesHtml)) {
          valuesHtml.focus();
        }
        const initialSelectionStart = valuesHtml.selectionStart;
        valuesHtml.value = valuesHtml.value.substring(0, initialSelectionStart - 1) + valuesHtml.value.substring(initialSelectionStart);
        valuesHtml.value = valuesHtml.value.replace(removeDuplicateSignRegExp, "$1");
        valuesHtml.setSelectionRange(initialSelectionStart - 1, initialSelectionStart - 1);
        break;

      case COMMAND_KEY.CLEAR:
        if (!valuesHtml.value.length) {
          return;
        }
        valuesHtml.value = "";
        valuesHtml.focus();
        break;
    }
  };

  //add event listeners for click, keydown and input change
  calculatorHtml.addEventListener("click", (event) => {
    if (!/number-|operand-|command-/.test(event.target.name)) {
      return;
    }

    if (/command-/.test(event.target.name)) {
      executeCommand(event.target.name);
      return;
    }
    valuesHtml.value += event.target.value;
    valuesHtml.dispatchEvent(inputEvent);
  });

  window.document.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    if (commandMapper[key]) {
      executeCommand(commandMapper[key]);
    }
  });

  valuesHtml.addEventListener("input", (event) => {
    const normalizeInputWithERegExp = /[^\d|\+|\-|\.|\*|\/|\^|e]/gi;
    const normalizeInputWithoutERegExp = /[^\d|\+|\-|\.|\*|\/|\^]/g;
    const trimWhiteSpaceRegExp = /\s|\t|\n|\r/g;
    const removeDuplicateDotRegExp = /(\d+\.\d+)\.{1,}/g;
    const eNotFollowedWithRegExp = /e(?=\.|\*|\/|\^|e)/g;
    const eNotAfterWithRegExp = /(?<!\d)e/g;
    const removeDuplicateERegExp = /(\d+e\d+)e{1,}/g;

    const initialSelectionStart = event.target.selectionStart;
    valuesHtml.value = event.target.value.toLowerCase()
      .replace(trimWhiteSpaceRegExp, "")
      .replace(!errFlag ? normalizeInputWithERegExp : normalizeInputWithoutERegExp, "")
      .replace(removeDuplicateSignRegExp, "$1")
      .replace(removeDuplicateDotRegExp, "$1")
      .replace(eNotFollowedWithRegExp, "")
      .replace(eNotAfterWithRegExp, "")
      .replace(removeDuplicateERegExp, "$1");
    if (valuesHtml.value.length >= initialSelectionStart && initialSelectionStart !== event.target.selectionStart) {
      valuesHtml.setSelectionRange(initialSelectionStart - 1, initialSelectionStart - 1);
    }

    if(errFlag) {
      errFlag = false;
    }
  });
  //once all is done, focus the input field
  valuesHtml.focus();
};

//wait for DOM to finish loading and then initialize the calculator
window.addEventListener("load", () => {
  //get the DOM elements
  const valuesHtml = window.document.querySelector(".calculator input[name=\"values\"]");
  const calculatorHtml = window.document.querySelector(".calculator");
  initCalulator(valuesHtml, calculatorHtml);
});