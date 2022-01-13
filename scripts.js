/**
 * Takes a string and returns an array of valid colors.
 *
 * @param {String} string - String containing colors delimited by line breaks
 * @returns {Array} - Array of valid colors
 */
function getInputColors(string) {
  const inputArray = string.split('\n');

  return inputArray.filter(color => tinycolor(color).isValid());
}

/**
 * Create the first row header (containing the x-axis color values).
 *
 * @param {Array} xAxisColors - Array of valid color values
 * @returns {String} - String containing HTML
 */
function buildHeaderRow(xAxisColors) {
  const headerCells = xAxisColors.map(color => {
    return `
      <th scope="col" style="
          --color: ${tinycolor(color).toHexString()};
          --text-color: ${tinycolor.mostReadable(color, ["#fff", "#000"]).toHexString()};
      ">
        ${color}
      </th>
    `;
  }).join('');

  return `
    <tr>
      <td></td>
      ${headerCells}
    </tr>
  `;
}

/**
 * Build all <td> cells in a single row.
 *
 * @param {Array} xAxisColors - Array of valid color values
 * @param {String} compareColor - String containing a single valid color
 * @returns {String} - String containing HTML
 */
function buildTableTds(xAxisColors, compareColor) {
  return xAxisColors.map(color => {
    return `
      <td style="
        --color-1: ${ tinycolor(color).toHexString() };
        --color-2: ${ tinycolor(compareColor).toHexString() };
      ">
        ${ tinycolor.readability(color, compareColor).toFixed(2) }
      </td>
    `;
  }).join('');
}

/**
 * Build all <tr> rows (one for each color on the Y axis).
 *
 * @param {Array} xAxisColors - Array of valid color values
 * @param {Array} yAxisColors - Array of valid color values
 * @returns {String} - String containing HTML
 */
function buildDataRows(xAxisColors, yAxisColors) {

  return yAxisColors.map(color => {
    return `
      <tr>
        <th scope="row" style="
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
 * Build the markup for the <table> element.
 *
 * @param {Array} xAxisColors - Array of valid color values
 * @param {Array} yAxisColors - Array of valid color values
 * @returns {String} - String containing HTML
 */
function buildTable(xAxisColors, yAxisColors) {
  return `
    <table>
      ${ buildHeaderRow(xAxisColors) }
      ${ buildDataRows(xAxisColors, yAxisColors) }
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
