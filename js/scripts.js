((tinycolor) => {
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
    if (xAxisColors.length) {
      const urlParams = new URLSearchParams(location.search);

      urlParams.set('xAxisColors', xAxisColors.join('|'));

      // If the X axis colors are different than the y axis colors, create a parameter, otherwise remove it.
      if (JSON.stringify(xAxisColors) !== JSON.stringify(yAxisColors)) {
        urlParams.set('yAxisColors', yAxisColors.join('|'));
      } else {
        urlParams.delete('yAxisColors');
      }

      window.history.replaceState({}, '', `${location.pathname}?${urlParams}`);
    }
  }

  /**
   * Reads in the current queryString and returns arrays of colors.
   *
   * @returns {Object} - Object containing xAxisColors and yAxisColors arrays.
   */
  function getColorsFromQueryParams() {
    const urlParams = new URLSearchParams(location.search);
    const queryParams = ['xAxisColors', 'yAxisColors'];
    const colorsObject = {}

    queryParams.forEach(axis => {
      colorsObject[axis] = urlParams.get(axis)?.split('|');
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
          <span>
            ${color}
          </span>
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
          --hover-text-color: ${ tinycolor.mostReadable(color, ["#fff", "#000"]).toHexString() };
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
   * Loads existing colors into form inputs.
   *
   * @param {Element} form - The form element to load querystring colors into.
   * @param {Object} - Object containing xAxisColors and yAxisColors arrays.
   */
  function loadColorsInto(form, queryParams) {
    const colorXInput = form.querySelector('.color-input-1');
    const colorYInput = form.querySelector('.color-input-2');
    const xAxisColors = queryParams?.xAxisColors;
    const yAxisColors = queryParams?.yAxisColors;

    colorXInput.value = Array.isArray(xAxisColors) ? xAxisColors.join('\n') : '';
    colorYInput.value = Array.isArray(yAxisColors) ? yAxisColors.join('\n') : '';
  }

  /**
   * Writes the <table> element HTML to the DOM and updates the query string.
   *
   * @param {Array} xAxisColors - Array of valid color values
   * @param {Array} yAxisColors - Array of valid color values
   */
  function writeTableToDOM(xAxisColors, yAxisColors) {
    if (xAxisColors.length) {
      document.querySelector('.table-container').innerHTML = buildTable(xAxisColors, yAxisColors);
    }

    setQueryParams(xAxisColors, yAxisColors);
  }

  /**
   * Handles the form submission.
   *
   * @param {Event} e - The submit event object
   */
  function handleSubmit(e) {
    const colorXInput = e.target.querySelector('.color-input-1');
    const colorYInput = e.target.querySelector('.color-input-2');
    const xAxisColors = getInputColors(colorXInput.value);
    const yAxisColors = colorYInput.value.trim().length ? getInputColors(colorYInput.value) : getInputColors(colorXInput.value);
    e.preventDefault(); // Don't reload the page.

    writeTableToDOM(xAxisColors, yAxisColors);
  }

  /**
   * Handles mouseover event for the table container. This add CSS classes to
   * the <th> and <td> cells so that the user can easily distinguish what
   * columns they are hovering above.
   *
   * @param {Event} e - The mouseover event object.
   */
  function handleTableMouseover(e) {
    document.querySelectorAll('.is-highlighted').forEach(el => el.classList.remove('is-highlighted'));
    if (e.target.matches(':is(th, td), :is(th, td) *')) {
      const tableCell = e.target.closest('th, td');
      const index = tableCell.cellIndex + 1;

      tableCell.closest('table').querySelectorAll(`:is(th, td):nth-child(${index})`).forEach(tableCell => {
        tableCell.classList.add('is-highlighted');
      });
    }
  }

  /**
   * Initialize everything.
   */
  function init() {
    const form = document.querySelector('.color-input-form');
    const tableContainer = document.querySelector('.table-container');
    const colorsFromParams = getColorsFromQueryParams();
    const xAxisColors = colorsFromParams.xAxisColors;
    const yAxisColors = colorsFromParams.yAxisColors ? colorsFromParams.yAxisColors : xAxisColors;

    form.addEventListener('submit', handleSubmit);

    loadColorsInto(form, getColorsFromQueryParams());
    writeTableToDOM(xAxisColors, yAxisColors);

    tableContainer.addEventListener('mouseover', handleTableMouseover);
  }

  // Lets do this!
  init();
})(tinycolor);
