((tinycolor) => {
  /**
   * Takes a string and returns an array of valid colors.
   *
   * @param {String} string - String containing colors delimited by line breaks
   * @returns {Array} - Array containing objects of colors and otional name strings.
   *  - {String} color - valid color
   *  - {String} [name] - optional name for the color
   */
  function getInputData(string) {
    const inputArray = string.split('\n');
    const outputArray = [];

    inputArray.forEach(line => {
      const lineArray = line.split(':'); // split lines by comma or colon
      const data = {};
      let lineHasValidColor = false;

      lineArray.forEach((item, index) => {
        if (index >= 2) return;
        item = item.replaceAll(/;(.*)/g, '').trim(); // Remove semicolon and anything after it, and trim.
        lineHasValidColor = false;

        if (tinycolor(item).isValid()) {
          data.color = item;
          lineHasValidColor = true;
        }
        else if (item.length) {
          data.name = item;
        }
      });

      if (Object.keys(data).length && lineHasValidColor) {
        outputArray.push(data)
      }
    });

    return outputArray;
  }

  /**
   * Builds and sets the querystring, thereby saving the grid to the URL.
   *
   * @param {Array} xAxisData - Array of objects containing valid colors and optional names
   * @param {Array} yAxisData - Array of objects containing valid colors and optional names
   */
  function setQueryParams(xAxisData, yAxisData) {
    if (xAxisData?.length) {
      const urlParams = new URLSearchParams(location.search);

      urlParams.set('xAxisData', encodeURIComponent(JSON.stringify(xAxisData)));

      // If the X axis data are different than the y axis data, create a parameter, otherwise remove it.
      if (JSON.stringify(xAxisData) !== JSON.stringify(yAxisData)) {
        urlParams.set('yAxisData', encodeURIComponent(JSON.stringify(yAxisData)));
      } else {
        urlParams.delete('yAxisData');
      }

      window.history.pushState({}, '', `${location.pathname}?${urlParams}`);
    }
  }

  /**
   * Reads in the current queryString and returns arrays of colors.
   *
   * @returns {Object} - Object containing xAxisColors and yAxisColors arrays.
   */
  function getDataFromQueryParams() {
    const urlParams = new URLSearchParams(location.search);
    const queryParams = ['xAxisData', 'yAxisData'];
    const colorsObject = {}

    queryParams.forEach(axis => {
      const paramsArray = JSON.parse(decodeURIComponent(urlParams.get(axis)));
      colorsObject[axis] = paramsArray;
      // colorsObject[axis] = paramsArray?.filter(data => {

      //   return true;
      //   // let lineHasValidColor = false;
      //   // data.forEach(item => {
      //   //   if (tinycolor(item).isValid()) {
      //   //     lineHasValidColor = true;
      //   //   }
      //   // })
      //   // return lineHasValidColor;
      // });
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
            ${('name' in data) ? `
              <div class="color-name">
                ${data.name}
              </div>
              ` : ''
            }
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
            ${('name' in data) ? `
              <div class="color-name">
                ${data.name}
              </div>
              ` : ''
            }

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
   * @param {Array} xAxisData - Array of valid color values
   * @param {Array} yAxisData - Array of valid color values
   */
  function hydrateForm(form, xAxisData, yAxisData) {
    const xInput = form.querySelector('.color-input-1');
    const yInput = form.querySelector('.color-input-2');

    if (Array.isArray(xAxisData)) {
      xInput.value = xAxisData.map(data => {
        return `${data.name}: ${data.color}`
      }).join('\n');
    }

    // xInput.value = Array.isArray(xAxisData) ? xAxisData.join('\n') : '';

    // If y-axis colors are exactly the same as the x-axis, don't populate the textarea.
    if (JSON.stringify(xAxisData) !== JSON.stringify(yAxisData)) {
      yInput.value = yAxisData.map(data => {
        return `${data.name}: ${data.color}`
      }).join('\n');
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

    if (updateQueryParams) setQueryParams(xAxisData, yAxisData);
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
  function handlePopstate() {
    const form = document.querySelector('.color-input-form');
    const dataFromParams = getDataFromQueryParams();
    const xAxisData = dataFromParams.xAxisData;
    const yAxisData = dataFromParams.yAxisData ? dataFromParams.yAxisData : xAxisData;

    hydrateForm(form, xAxisData, yAxisData);
    writeTableToDOM(xAxisData, yAxisData, false);
  }

  /**
   * Initialize everything.
   */
  function init() {
    const form = document.querySelector('.color-input-form');
    const tableContainer = document.querySelector('.table-container');
    const dataFromParams = getDataFromQueryParams();
    const xAxisData = dataFromParams.xAxisData;
    const yAxisData = dataFromParams.yAxisData ? dataFromParams.yAxisData : xAxisData;

    window.addEventListener('popstate', handlePopstate);
    form.addEventListener('submit', handleSubmit);
    tableContainer.addEventListener('mouseover', handleTableMouseover);

    hydrateForm(form, xAxisData, yAxisData);
    writeTableToDOM(xAxisData, yAxisData);
  }

  // Lets do this!
  init();
})(tinycolor);
