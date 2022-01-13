/**
 * Takes a string and makes an array of valid colors.
 *
 * @param {String} string
 * @returns Array
 */
function getInputColors(string) {
  const inputArray = string.split('\n');

  return inputArray.filter(color => tinycolor(color).isValid());
}

/**
 * Build all <td> cells in a single row.
 *
 * @param {Array} xAxisColors
 * @param {String} currentColor
 * @returns String
 */
function buildTableTds(xAxisColors, currentColor) {
  return xAxisColors.map(color => {
    return `
      <td style="
        --color-1: ${ tinycolor(color).toHexString()};
        --color-2: ${ tinycolor(currentColor).toHexString() };
      ">
        ${ tinycolor.readability(color, currentColor).toFixed(2) }
      </td>
    `;
  }).join('');
}

/**
 * Build all <tr> rows (one for each color on the Y axis).
 *
 * @param {Array} xAxisColors
 * @param {Array} yAxisColors
 * @returns String
 */
function buildTableTr(xAxisColors, yAxisColors) {

  return yAxisColors.map((color, index) => {
    return `
      <tr scope="row">
        <th style="
          --color: ${ tinycolor(color).toHexString()};
          --text-color: ${ tinycolor.mostReadable(color, ["#fff", "#000"]).toHexString() };
        ">
          ${ color }
        </th>
        ${ buildTableTds(xAxisColors, color) }
      </tr>
    `;
  }).join('');
}

/**
 * Create the first row header for the table.
 *
 * @param {Array} xAxisColors
 * @returns String
 */
function buildTableRowHeader(xAxisColors) {
  const headerCells =  xAxisColors.map(color => {
    return `
      <th style="
          --color: ${ tinycolor(color).toHexString()};
          --text-color: ${tinycolor.mostReadable(color, ["#fff", "#000"]).toHexString() };
      ">
        ${ color }
      </th>
    `;
  }).join('');

  return `
    <tr>
      <td></td>
      ${ headerCells }
    </tr>
  `;
}

/**
 * Build the markup for the <table> element.
 *
 * @param {Array} xAxisColors
 * @param {Array} yAxisColors
 * @returns String
 */
function buildTable(xAxisColors, yAxisColors) {
  return `
    <table>
      ${ buildTableRowHeader(xAxisColors, yAxisColors) }
      ${ buildTableTr(xAxisColors, yAxisColors) }
    </table>
  `;
}

/**
 * Event listener for form submission.
 */
document.querySelector('.color-input-form').addEventListener('submit', e => {
  const colorXInput = e.target.querySelector('.color-input-1');
  const colorYInput = e.target.querySelector('.color-input-2');
  const xAxisColors = getInputColors(colorXInput.value);
  const yAxisColors = colorYInput.value.trim().length ? getInputColors(colorYInput.value) : getInputColors(colorXInput.value);

  e.preventDefault(); // Don't reload the page.
  document.querySelector('.table-container').innerHTML = buildTable(xAxisColors, yAxisColors);
});
