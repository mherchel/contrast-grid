

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
 *
 * @param {Array} colors
 * @param {String} currentColumnColor
 * @returns
 */
function buildTableTds(colors, currentColumnColor) {
  return colors.map(color => {
    return `
      <td>${ tinycolor.readability(color, currentColumnColor).toFixed(2) }</td>
    `;
  }).join('');
}

/**
 *
 * @param {Array} colors
 */
function buildTableTr(colors) {
  return colors.map(color => {
    return `
      <tr scope="row">
        <th>${ color }</th>
        ${ buildTableTds(colors, color) }
      </tr>
    `;
  }).join('');
}

/**
 *
 * @param {Array} colors
 * @returns String
 */
function buildTableRowHeader(colors) {
  const headerCells =  colors.map(color => {
    return `
      <th>${ color }</th>
    `;
  }).join('');

  return `
    <tr>
      <td></td>
      ${ headerCells }
    </tr>
  `;
}


function buildTable(colors) {
  return `
    <table>
      ${ buildTableRowHeader(colors) }
      ${ buildTableTr(colors) }
    </table>
  `;
}

document.querySelector('.color-input-form').addEventListener('submit', e => {
  const colorInput = e.target.querySelector('textarea')
  const colors = getInputColors(colorInput.value);

  e.preventDefault(); // Don't reload the page.
  document.querySelector('.table-container').innerHTML = buildTable(colors);
});
