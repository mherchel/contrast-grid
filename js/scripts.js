((tinycolor) => {
  /**
   * Takes a string and returns an array of valid colors.
   *
   * @param {String} string - String containing colors delimited by line breaks
   * @returns {Array} - Array of containing object with color and names
   */
  function getInputData(string) {
    const inputArray = string.split('\n');
    const outputArray = [];

    inputArray.forEach(line => {
      const lineArray = line.split(':'); // split lines by comma or colon
      const data = {};

      lineArray.forEach((item, index) => {
        if (index >= 2) return;
        item = item.replaceAll(';', '').trim(); // Strip any semicolons and trim

        if (tinycolor(item).isValid()) {
          data.color = item;
        }
        else if (item.length) {
          data.name = item;
        }
      });

      if (Object.keys(data).length) {
        outputArray.push(data)
      }
    });

    return outputArray;
  }

  /**
   * Builds and sets the querystring, thereby saving the grid to the URL.
   *
   * @param {Array} xAxisColors - Array of valid color values
   * @param {Array} yAxisColors - Array of valid color values
   */
  function setQueryParams(xAxisColors, yAxisColors) {
    if (xAxisColors?.length) {
      const urlParams = new URLSearchParams(location.search);

      urlParams.set('xAxisColors', xAxisColors.join('|'));

      // If the X axis colors are different than the y axis colors, create a parameter, otherwise remove it.
      if (JSON.stringify(xAxisColors) !== JSON.stringify(yAxisColors)) {
        urlParams.set('yAxisColors', yAxisColors.join('|'));
      } else {
        urlParams.delete('yAxisColors');
      }

      window.history.pushState({}, '', `${location.pathname}?${urlParams}`);
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
      paramsArray = urlParams.get(axis)?.split('|');
      colorsObject[axis] = paramsArray?.filter(color => tinycolor(color).isValid());
    });

    return colorsObject;
  }

  /**
   * Create the first row header (containing the x-axis color values).
   *
   * @param {Array} xAxisData - Array of valid color values
   * @returns {String} - String containing HTML
   */
  function buildHeaderRow(xAxisData) {
    const headerCells = xAxisData.map(data => {
      return `
        <th scope="col" style="
            --color: ${tinycolor(data.color).toHexString()};
            --text-color: ${tinycolor.mostReadable(data.color, ["#fff", "#000"]).toHexString()};
        ">
          <span>
            <div style="color: white; background: hotpink;">
              ${data.name}
            </div>
            ${data.color}
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
   * @param {Array} xAxisData - Array of valid color values
   * @param {String} compareColor - String containing a single valid color
   * @returns {String} - String containing HTML
   */
  function buildTableTds(xAxisData, compareColor) {
    return xAxisData.map(data => {
      return `
        <td style="
          --color-1: ${ tinycolor(data.color).toHexString() };
          --color-2: ${ tinycolor(compareColor).toHexString() };
          --hover-text-color: ${ tinycolor.mostReadable(data.color, ["#fff", "#000"]).toHexString() };
        ">
          ${ tinycolor.readability(data.color, compareColor).toFixed(2) }
        </td>
      `;
    }).join('');
  }

  /**
   * Build all <tr> rows (one for each color on the Y axis).
   *
   * @param {Array} xAxisData - Array of valid color values
   * @param {Array} yAxisData - Array of valid color values
   * @returns {String} - String containing HTML
   */
  function buildDataRows(xAxisData, yAxisData) {

    return yAxisData.map(data => {
      return `
        <tr>
          <th scope="row" style="
            --color: ${ tinycolor(data.color).toHexString()};
            --text-color: ${ tinycolor.mostReadable(data.color, ["#fff", "#000"]).toHexString() };
          ">
            ${ data.color }
          </th>
          ${ buildTableTds(xAxisData, data.color) }
        </tr>
      `;
    }).join('');
  }

  /**
   * Build the markup for the <table> element.
   *
   * @param {Array} xAxisData - Array of valid color values
   * @param {Array} yAxisData - Array of valid color values
   * @returns {String} - String containing HTML
   */
  function buildTable(xAxisData, yAxisData) {
    return `
      <table>
        ${ buildHeaderRow(xAxisData) }
        ${ buildDataRows(xAxisData, yAxisData) }
      </table>
    `;
  }

  /**
   * Loads existing colors into form inputs.
   *
   * @param {Element} form - The form element to load querystring colors into.
   * @param {Array} xAxisColors - Array of valid color values
   * @param {Array} yAxisColors - Array of valid color values
   */
  function hydrateForm(form, xAxisColors, yAxisColors) {
    const colorXInput = form.querySelector('.color-input-1');
    const colorYInput = form.querySelector('.color-input-2');

    colorXInput.value = Array.isArray(xAxisColors) ? xAxisColors.join('\n') : '';

    // If y-axis colors are exactly the same as the x-axis, don't populate the textarea.
    if (JSON.stringify(xAxisColors) !== JSON.stringify(yAxisColors)) {
      colorYInput.value = Array.isArray(yAxisColors) ? yAxisColors.join('\n') : '';
    }
  }

  /**
   * Writes the <table> element HTML to the DOM and updates the query string.
   *
   * @param {Array} xAxisData - Array of valid color values
   * @param {Array} yAxisData - Array of valid color values
   * @param {Boolean} updateQueryParams - Should the query string be updated to reflect the new colors?
   */
  function writeTableToDOM(xAxisData, yAxisData, updateQueryParams = true) {
    if (xAxisData?.length) {
      document.querySelector('.table-container').innerHTML = buildTable(xAxisData, yAxisData);
    }

    // if (updateQueryParams) setQueryParams(xAxisData, yAxisData);
  }

  /**
   * Handles the form submission.
   *
   * @param {Event} e - The submit event object
   */
  function handleSubmit(e) {
    const xInput = e.target.querySelector('.color-input-1');
    const yInput = e.target.querySelector('.color-input-2');
    const xAxisData = getInputData(xInput.value);
    const yAxisData = yInput.value.trim().length ? getInputData(yInput.value) : getInputData(xInput.value);
    e.preventDefault(); // Don't reload the page.

    writeTableToDOM(xAxisData, yAxisData);
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
   * Handle the popstate event, which occurs when the page is navigated to using
   * the browsers' "back", and "forward" buttons.
   */
  // function handlePopstate() {
  //   const form = document.querySelector('.color-input-form');
  //   const colorsFromParams = getColorsFromQueryParams();
  //   const xAxisColors = colorsFromParams.xAxisColors;
  //   const yAxisColors = colorsFromParams.yAxisColors ? colorsFromParams.yAxisColors : xAxisColors;

  //   hydrateForm(form, xAxisColors, yAxisColors);
  //   writeTableToDOM(xAxisColors, yAxisColors, false);
  // }

  /**
   * Initialize everything.
   */
  function init() {
    const form = document.querySelector('.color-input-form');
    const tableContainer = document.querySelector('.table-container');
    // const colorsFromParams = getColorsFromQueryParams();
    // const xAxisColors = colorsFromParams.xAxisColors;
    // const yAxisColors = colorsFromParams.yAxisColors ? colorsFromParams.yAxisColors : xAxisColors;

    // window.addEventListener('popstate', handlePopstate);
    form.addEventListener('submit', handleSubmit);
    tableContainer.addEventListener('mouseover', handleTableMouseover);

    // hydrateForm(form, xAxisColors, yAxisColors);
    // writeTableToDOM(xAxisColors, yAxisColors);
  }

  // Lets do this!
  init();
})(tinycolor);
