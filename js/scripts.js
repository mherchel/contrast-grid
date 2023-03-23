((tinycolor) => {
  /**
   * Takes a string and returns an array of objects containing names, colors.
   *
   * @param {String} string - String containing colors delimited by line breaks
   * @returns {Array} - Array containing objects of colors and optional name strings.
   *  - {String} color - valid color
   *  - {String} [name] - optional name for the color
   */
  function getInputData(string) {
    const inputArray = string.split('\n');
    const outputArray = [];

    inputArray.forEach(line => {
      const lineArray = line.split(':');
      const data = {};
      let lineHasValidColor = false;

      lineArray.forEach((item, index) => {
        if (index >= 2) return;
        item = item.replaceAll(/;(.*)/g, '').trim(); // Remove semicolon and anything after it, then trim.
        item = item.replaceAll(/,$/g, '').trim(); // If a comma is the last character, yank that sucka out (this is useful for Sass maps of colors).
        lineHasValidColor = false;

        if (tinycolor(item).isValid()) {
          data.color = item;
          lineHasValidColor = true;
        } else if (item.length) {
          data.name = item;
        }
      });

      if (Object.keys(data).length && lineHasValidColor) {
        outputArray.push(data);
      }
    });

    return outputArray;
  }

  /**
   * Builds and sets the querystring, thereby saving the grid to the URL.
   *
   * @param {Array} xAxisData - Array of objects containing valid colors and optional names.
   * @param {Array} yAxisData - Array of objects containing valid colors and optional names.
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
   * Reads in the current queryString and returns an object containing an array
   * for each axis containing [optional] name and color.
   *
   * @returns {Object} - Object containing xAxisData and yAxisData arrays.
   */
  function getDataFromQueryParams() {
    const urlParams = new URLSearchParams(location.search);
    const queryParams = ['xAxisData', 'yAxisData'];
    const colorsObject = {}

    queryParams.forEach(axis => {
      const paramsArray = JSON.parse(decodeURIComponent(urlParams.get(axis)));
      colorsObject[axis] = paramsArray;
    });

    return colorsObject;
  }

  /**
   * Create the first row header (containing the x-axis color values).
   *
   * @param {Array} xAxisData - Array of objects containing valid colors and optional names.
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
   * @param {Array} xAxisData - Array of objects containing valid colors and optional names.
   * @param {String} compareColor - String containing a single valid color
   * @param {Number} contrast - Color contrast value set.
   * @param {Boolean} hideInput - Should colors that don't meet the set contrast be hidden?
   * @returns {String} - String containing HTML
   */
  function buildTableTds(xAxisData, compareColor, contrast, hideInput) {
    if (!hideInput) {
      contrast = 0;
    }
    return xAxisData.map(data => {
      let tdClass = "";
      const readability = tinycolor.readability(data.color, compareColor);
      if (readability < contrast) {
        tdClass = "doesNotMeet";
      }


      return `
        <td class="${ tdClass }" style="
          --color-1: ${ tinycolor(data.color).toHexString() };
          --color-2: ${ tinycolor(compareColor).toHexString() };
          --hover-text-color: ${ tinycolor.mostReadable(data.color, ["#fff", "#000"]).toHexString() };
        ">
          ${ readability.toFixed(2) }
        </td>
      `;
    }).join('');
  }

  /**
   * Build all <tr> rows (one for each color on the Y axis).
   *
   * @param {Array} xAxisData - Array of objects containing valid colors and optional names.
   * @param {Array} yAxisData - Array of objects containing valid colors and optional names.
   * @param {Number} contrast - Color contrast value set.
   * @param {Boolean} hideInput - Should colors that don't meet the set contrast be hidden?
   * @returns {String} - String containing HTML
   */
  function buildDataRows(xAxisData, yAxisData, contrast, hideInput) {

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
          ${ buildTableTds(xAxisData, data.color, contrast, hideInput) }
        </tr>
      `;
    }).join('');
  }

  /**
   * Build the markup for the <table> element.
   *
   * @param {Array} xAxisData - Array of objects containing valid colors and optional names.
   * @param {Array} yAxisData - Array of objects containing valid colors and optional names.
   * @param {Number} contrast - Color contrast value set.
   * @param {Boolean} hideInput - Should colors that don't meet the set contrast be hidden?
   * @returns {String} - String containing HTML
   */
  function buildTable(xAxisData, yAxisData, contrast, hideInput) {
    return `
      <table>
        ${ buildHeaderRow(xAxisData) }
        ${ buildDataRows(xAxisData, yAxisData, contrast, hideInput) }
      </table>
    `;
  }

  /**
   * Loads existing colors into form inputs.
   *
   * @param {Element} form - The form element to load querystring colors into.
   * @param {Array} xAxisData - Array of objects containing valid colors and optional names.
   * @param {Array} yAxisData - Array of objects containing valid colors and optional names.
   */
  function hydrateForm(form, xAxisData, yAxisData) {
    const xInput = form.querySelector('.color-input-x');
    const yInput = form.querySelector('.color-input-y');

    if (Array.isArray(xAxisData)) {
      xInput.value = xAxisData.map(data => {
        return `${('name' in data) ? data.name + ': ': ''} ${data.color}`
      }).join('\n');
    }

    // xInput.value = Array.isArray(xAxisData) ? xAxisData.join('\n') : '';

    // If y-axis colors are exactly the same as the x-axis, don't populate the textarea.
    if (JSON.stringify(xAxisData) !== JSON.stringify(yAxisData)) {
      yInput.value = yAxisData.map(data => {
        return `${('name' in data) ? data.name + ': ' : ''} ${data.color}`
      }).join('\n');
    }
  }

  /**
   * Writes the <table> element HTML to the DOM and updates the query string.
   *
   * @param {Array} xAxisData - Array of objects containing valid colors and optional names.
   * @param {Array} yAxisData - Array of objects containing valid colors and optional names.
   * @param {Number} contrast - Color contrast value set.
   * @param {Boolean} hideInput - Should colors that don't meet the set contrast be hidden?
   * @param {Boolean} updateQueryParams - Should the query string be updated to reflect the new colors?
   */
  function writeTableToDOM(xAxisData, yAxisData, contrast, hideInput, updateQueryParams = true) {
    if (xAxisData?.length) {
      document.querySelector('.table-container').innerHTML = buildTable(xAxisData, yAxisData, contrast, hideInput);
    }

    if (updateQueryParams) setQueryParams(xAxisData, yAxisData);
  }

  /**
   * Reverses the data in the X and Y text inputs, and then rebuilds the table.
   */
  function reverseInputData() {
    const form = document.querySelector('.color-input-form');
    const xInput = form.querySelector('.color-input-x');
    const yInput = form.querySelector('.color-input-y');
    const contrastInput = contrast.value;
    const hideInput = hideBelow.checked;
    const xAxisText = xInput.value;
    const yAxisText = yInput.value;

    if (!yInput.value.trim().length) return; // Don't do 💩 if Y axis is not populated.

    // Flip the data in the text fields.
    xInput.value = yAxisText;
    yInput.value = xAxisText;

    // Get the new data from the inputs and then rebuild the table.
    const xAxisData = getInputData(xInput.value);
    const yAxisData = getInputData(yInput.value);

    writeTableToDOM(xAxisData, yAxisData, contrastInput, hideInput);
  }

  /**
   * Handles the form submission.
   *
   * @param {Event} e - The submit event object
   */
  function handleSubmit(e) {
    const xInput = e.target.querySelector('.color-input-x');
    const yInput = e.target.querySelector('.color-input-y');
    const xAxisData = getInputData(xInput.value);
    const yAxisData = yInput.value.trim().length ? getInputData(yInput.value) : getInputData(xInput.value);
    const contrastInput = e.target.querySelector('#contrast').value;
    const hideInput = e.target.querySelector('#hideBelow').checked;
    e.preventDefault(); // Don't reload the page.

    writeTableToDOM(xAxisData, yAxisData, contrastInput, hideInput);
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
    writeTableToDOM(xAxisData, yAxisData, contrastInput, hideInput, false); // Do not update the query params when writing data to DOM.
  }

  /**
   * Handle the blur event for the range input. Ensures output value matches range value.
   * 
   * @param {Event} e - The blur event object.
   */
  function handleRangeBlur(e) {
    const form = document.querySelector('.color-input-form');
    form.contrastValue.value = e.target.value;
  }

  /**
   * Handle the change event for the range input. Updates Hide Colors Below button name to match.
   * 
   * @param {Event} e - The change event object.
   */
  function handleRangeChange() {
    contrastBelow.textContent = contrast.value;
  }
  /**
   * Handle the click events for the contrast buttons. Updates range input, output element, 
   * and Hide Colors Below button.
   * 
   * @param {Event} e - The click event object.
   */
  function handleContrastButtonClick(e) {
    const form = document.querySelector('.color-input-form');
    contrast.value = e.target.dataset.value;
    form.contrastValue.value = e.target.dataset.value;
    contrastBelow.textContent = e.target.dataset.value;
  }

  /**
   * Initialize everything.
   */
  function init() {
    const form = document.querySelector('.color-input-form');
    const reverseDataButton = document.querySelector('.button-reverse');
    const contrastButtons = document.querySelectorAll('.datalist-buttons > button[data-value]');
    const tableContainer = document.querySelector('.table-container');
    const dataFromParams = getDataFromQueryParams();
    const xAxisData = dataFromParams.xAxisData;
    const yAxisData = dataFromParams.yAxisData ? dataFromParams.yAxisData : xAxisData;

    window.addEventListener('popstate', handlePopstate);
    form.addEventListener('submit', handleSubmit);
    reverseDataButton.addEventListener('click', reverseInputData);
    contrast.addEventListener('blur', handleRangeBlur);
    contrast.addEventListener('change', handleRangeChange);
    contrastButtons.forEach((b) => {
      b.addEventListener('click', handleContrastButtonClick);
    });

    tableContainer.addEventListener('mouseover', handleTableMouseover);

    hydrateForm(form, xAxisData, yAxisData);
    writeTableToDOM(xAxisData, yAxisData, 7, false);
  }

  // Lets do this!
  init();
})(tinycolor);
