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
 * Builds and sets the querystring, thereby saving the grid to the URL.
 *
 * @param {Array} xAxisColors - Array of valid color values
 * @param {Array} yAxisColors - Array of valid color values
 */
function setQueryParams(xAxisColors, yAxisColors) {
  const urlParams = new URLSearchParams(location.search);
  urlParams.set('xAxisColors', xAxisColors.join('|'));

  if (JSON.stringify(xAxisColors) !== JSON.stringify(yAxisColors)) {
    urlParams.set('yAxisColors', yAxisColors.join('|'));
  }
  window.history.replaceState({}, '', `${location.pathname}?${urlParams}`);
}

/**
 * Reads in the current queryString and returns arrays of colors.
 *
 * @returns {Object} - Object containing xAxisColors and yAxisColors arrays.
 */
function getQueryParams() {
  const urlParams = new URLSearchParams(location.search);
  const queryParams = ['xAxisColors', 'yAxisColors'];
  const colorsObject = {}

  queryParams.forEach(axis => {
    // if (urlParams.get(axis)?.length) {
      colorsObject[axis] = urlParams.get(axis)?.split('|');
    // }
  });
  return colorsObject;
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
 * Pulls colors from queryString into form elements.
 *
 * @param {Element} form - The form element to load querystring colors into.
 */
function loadColors(form) {
  const colorXInput = form.querySelector('.color-input-1');
  const colorYInput = form.querySelector('.color-input-2');
  const queryParams = getQueryParams();
  const xAxisColors = queryParams?.xAxisColors;
  const yAxisColors = queryParams?.yAxisColors;

  colorXInput.value = Array.isArray(xAxisColors) ? xAxisColors.join('\n') : '';
  colorYInput.value = Array.isArray(yAxisColors) ? yAxisColors.join('\n') : '';
}

/**
 * Handles the form submission.
 *
 * @param {Event} e - The event object
 */
function handleSubmit(e) {
  const colorXInput = e.target.querySelector('.color-input-1');
  const colorYInput = e.target.querySelector('.color-input-2');
  const xAxisColors = getInputColors(colorXInput.value);
  const yAxisColors = colorYInput.value.trim().length ? getInputColors(colorYInput.value) : getInputColors(colorXInput.value);

  e.preventDefault(); // Don't reload the page.
  document.querySelector('.table-container').innerHTML = buildTable(xAxisColors, yAxisColors);

  setQueryParams(xAxisColors, yAxisColors);
}

/**
 * Initialize everything.
 */
function init() {
  const form = document.querySelector('.color-input-form');
  form.addEventListener('submit', handleSubmit);

  loadColors(form);
  // Programmatically trigger submit event to create color grid table.
  let submitEvent = new CustomEvent('submit');
  form.dispatchEvent(submitEvent);
}

// Lets do this!
init();
