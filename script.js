reset();
onTextAreaChanged();
setTheme();

function setTheme() {
    var theme = localStorage.getItem('theme');
    if (theme == null || theme == 'dark') {
        toggleTheme();
        localStorage.setItem('theme', 'dark');
    } else if (theme == 'light') {
        localStorage.setItem('theme', 'light');
    }
}

function toggleTheme() {
    var switchableElementsPrimary = $('.theme-switchable');
    var switchableElementsSecondary = $('.theme-switchable2');
    switchableElementsPrimary.toggleClass('light-theme dark-theme');
    switchableElementsSecondary.toggleClass('light-theme-secondary dark-theme-secondary');

    if (localStorage.getItem('theme') == 'dark') {
        localStorage.setItem('theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
    }
}

function onTextAreaChanged() {
    $('#inputText').on('input', function () {
        // code to execute when textarea is changed
        let oldCustomChar = $('#inputText').data("custom-char");
        // console.log(oldCustomChar)

        let newVal = $(this).val();
        let startText = '[] = {';
        let endText = '};';

        // Check if customChar byte array has been changed
        if (newVal.indexOf(startText) !== -1 && newVal.indexOf(endText) !== -1) {
            let newCustomChar = newVal.substring(newVal.indexOf(startText) + 7, newVal.indexOf(endText));
            // console.log(newCustomChar);
            // console.log("newCustomChar vs old", newCustomChar == oldCustomChar);
            // console.log(isValidFormat(newCustomChar));

            if (isValidFormat(newCustomChar)) {
                newCustomChar = cleanEnds(newCustomChar);
                // updateCustomChar(newCustomChar);
                // TODO: bug, cannot change outside of byte customchar[]
                // TODO: can update multiple squares instead of just one at a time.
                let rowcol = checkChange(oldCustomChar, newCustomChar);
                changeColor(rowcol);
            }
            // console.log('Custom char array has been changed');
        }
    });
}

function checkChange(oldCustomChar, newCustomChar) {
    // console.log(customCharToGridArr(oldCustomChar))
    oldCustomChar = customCharToGridArr(oldCustomChar)
    newCustomChar = customCharToGridArr(newCustomChar)

    // Loop through each row and column of the customChar arrays
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            // Compare the old and new customChar values
            if (oldCustomChar[row][col] != newCustomChar[row][col]) {
                // Log the row, column, and old and new customChar values
                // console.log("Row: " + row + ", Column: " + col + ", Old Value: " + oldCustomChar[row][col] + ", New Value: " + newCustomChar[row][col]);
                return `${row}${col}`
            }
        }
    }
}

function isValidFormat(input) {
    const rows = input.trim().split('\n');
    // console.log(rows)
    if (rows.length !== 8) {
        return false;
    }

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!/^0b[01]{5}(,)?$/.test(row)) {
            return false;
        }
        if (i < rows.length - 1 && !row.endsWith(',')) {
            return false;
        }
    }

    return true;
}

function reset() {
    addGrid();
    addText();
}

function invert() {
    let customChar = getCustomChar();
    let customCharArr = customCharToArr(customChar);

    rows = 8
    let newCustomChar = "";
    for (let i = 0; i < rows; i++) {
        newCustomChar += "  0b"
        let strippedStr = customCharArr[i].substr(2);
        // console.log(strippedStr);
        for (let j = 0; j < strippedStr.length; j++) {
            let char = strippedStr[j];

            char = (char == '0') ? '1' : '0';
            newCustomChar += char

            // console.log(strippedStr[j]);
        }
        newCustomChar += ",\n"
    }
    newCustomChar = cleanEnds(newCustomChar);
    // console.log(newCustomChar);

    updateCustomChar(newCustomChar);
    addText(null, null, newCustomChar);
    updateGrid();
}

function addGrid() {
    let inputScreen = $('#inputScreen');
    let rows = 8;
    let cols = 5;
    let grid = "";
    for (let i = 0; i < rows; i++) {
        grid += "<div class='row m-0 h-100 w-100'>";
        for (let j = 0; j < cols; j++) {
            checkThemeDiv = $('#tooltip');
            if (checkThemeDiv.hasClass('light-theme-secondary')) {
                // Do something if the element has the 'light-theme' class
                grid += `<div id='${i}${j}' class='theme-switchable light-theme col m-1 text-black p-0 w-100 ratio' data-flag="false" onclick='changeColor("${i}${j}")'></div>`;
            } else {
                // Do something else if the element does not have the 'light-theme' class
                grid += `<div id='${i}${j}' class='theme-switchable dark-theme col m-1 text-black p-0 w-100 ratio' data-flag="false" onclick='changeColor("${i}${j}")'></div>`;
            }
        }
        grid += "</div>";
    }
    inputScreen.html(grid);
}

function createCustomChar() {
    let rows = 8;
    let cols = 5;

    let customChar = "";
    for (let i = 0; i < rows; i++) {
        customChar += "  0b"
        for (let j = 0; j < cols; j++) {
            customChar += "0"
        }
        customChar += ",\n"
    }

    return cleanEnds(customChar);
}

function customCharToArr(customChar) {
    cleanCustomChar = customChar.replace(/\s+/g, "");
    return cleanCustomChar.split(",");
}

function customCharToGridArr(customChar) {
    let arr = customChar.split(",\n").map(row => row.replace("0b", "").trim().split("").map(num => parseInt(num)));
    return arr;
}

function cleanEnds(customChar) {
    customChar = customChar.trimEnd();
    if (customChar.slice(-1) === ",") { // check if last character is comma
        customChar = customChar.slice(0, -1); // remove last character
    }
    return customChar
}

function customCharArrToStr(customCharArr) {
    customChar = "  ";
    customChar += customCharArr.join(',\n  ');
    return cleanEnds(customChar);
}

function copyText() {
    var textToCopy = $('#inputText').val();
    navigator.clipboard.writeText(textToCopy);
    // alert('Text copied!');
    // Show the tooltip for 2 seconds
    $("#tooltip").show();

    setTimeout(function () {
        $("#tooltip").hide();
    }, 2000);
}

function addText(rowcol = null, triggered = null, customChar = createCustomChar()) {
    // console.log(rowcol, triggered)
    updateCustomChar(customChar)
    if (rowcol) {
        let customCharArr = customCharToArr(customChar)
        // console.log(customCharArr);

        clickedRow = parseInt(rowcol.charAt(0))
        clickedCol = parseInt(rowcol.charAt(1)) + 2
        newChar = (!triggered) ? '1' : '0'

        let newStr = customCharArr[clickedRow]
        // console.log(clickedRow, clickedCol, newChar)
        newStr = newStr.substring(0, clickedCol) + newChar + newStr.substring(clickedCol + 1);
        // console.log(newStr);
        customCharArr[clickedRow] = newStr
        customChar = customCharArrToStr(customCharArr)
        updateCustomChar(customChar)

        // console.log(customChar);
    }

    let text = `#include <LiquidCrystal.h>

LiquidCrystal lcd(12, 11, 5, 4, 3, 2); // RS, E, D4, D5, D6, D7

byte customChar[] = {
${customChar}
};

void setup() {
  lcd.begin(16, 2);
  lcd.createChar(0, customChar);
  lcd.home();
  lcd.write(0);
}

void loop() { }`

    $("#inputText").val(text);
}

function updateCustomChar(customChar) {
    let customCharDiv = $('#inputText');
    customCharDiv.data("custom-char", customChar);
    // console.log(customChar)
}

function getCustomChar() {
    return $('#inputText').data("custom-char");
}

function updateGrid() {
    let rows = 8;
    let cols = 5;
    customChar = getCustomChar()
    // console.log("customChar")
    // console.log(customChar)

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let myDiv = $('#' + `${i}${j}`);
            let triggered = myDiv.data("flag");
            if (triggered) {
                myDiv.data("flag", false);
                if (myDiv.hasClass('light-theme')) {
                    // Do something if the element has the 'light-theme' class
                    myDiv.toggleClass('contrast-theme');
                    myDiv.addClass('light-theme');
                } else {
                    // Do something else if the element does not have the 'light-theme' class
                    myDiv.toggleClass('contrast-theme');
                    myDiv.addClass('dark-theme');
                }
            } else {
                myDiv.data("flag", true);
                myDiv.addClass('contrast-theme');
            }
        }
    }
}

function changeColor(rowcol) {
    let myDiv = $('#' + rowcol);
    // console.log(rowcol);
    let triggered = myDiv.data("flag");
    // console.log(typeof (triggered));
    // console.log(triggered);
    customChar = getCustomChar()
    if (!triggered) {
        myDiv.data("flag", true);

        myDiv.addClass('contrast-theme');

        addText(rowcol, triggered, customChar);
    } else {
        myDiv.data("flag", false);

        if (myDiv.hasClass('light-theme')) {
            // Do something if the element has the 'light-theme' class
            myDiv.toggleClass('contrast-theme');
            myDiv.addClass('light-theme');
        } else {
            // Do something else if the element does not have the 'light-theme' class
            myDiv.toggleClass('contrast-theme');
            myDiv.addClass('dark-theme');
        }
        addText(rowcol, triggered, customChar);
    }
}
