/**
 * Takes a string and makes an array of valid colors.
 *
 * @param {String} string
 * @returns
 */
function getInputColors(string) {
  const inputArray = string.split('\n');

  return inputArray.filter(color => tinycolor(color).isValid());
}

/**
 * Build a TD table cell for each color.
 *
 * @param {Array} colors
 * @param {String} currentColumnColor
 * @returns
 */
function buildTableTds(colors, currentColumnColor) {
  return colors.map(color => {
    return `
      <td style="
        --color-1: ${ tinycolor(color).toHexString()};
        --color-2: ${ tinycolor(currentColumnColor).toHexString() };
      ">
        ${ tinycolor.readability(color, currentColumnColor).toFixed(2) }
      </td>
    `;
  }).join('');
}

/**
 * Build a TR rows for each color.
 *
 * @param {Array} colors
 */
function buildTableTr(colors) {
  return colors.map(color => {
    return `
      <tr scope="row">
        <th style="
          --color: ${ tinycolor(color).toHexString()};
          --text-color: ${ tinycolor.mostReadable(color, ["#fff", "#000"]).toHexString() };
        ">
          ${ color }
        </th>
        ${ buildTableTds(colors, color) }
      </tr>
    `;
  }).join('');
}

/**
 * Create the first row header for the table.
 *
 * @param {Array} colors
 * @returns String
 */
function buildTableRowHeader(colors) {
  const headerCells =  colors.map(color => {
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
 * @param {Array} colors
 * @returns String
 */
function buildTable(colors) {
  return `
    <table>
      ${ buildTableRowHeader(colors) }
      ${ buildTableTr(colors) }
    </table>
  `;
}

/**
 * Event listener for form submission.
 */
document.querySelector('.color-input-form').addEventListener('submit', e => {
  const colorInput = e.target.querySelector('textarea')
  const colors = getInputColors(colorInput.value);

  e.preventDefault(); // Don't reload the page.
  document.querySelector('.table-container').innerHTML = buildTable(colors);
});
