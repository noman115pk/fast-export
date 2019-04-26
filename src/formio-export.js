import _ from 'lodash';
import FormioExportUtils from './utils';
import FormioComponent from './components/formio';

// Import export plugins
import {
  toHtml,
  toPdf,
  toXlsx
} from './plugins';

/**
 * Class for exporting formio components into different formats
 *
 * @class FormioExport
 */
class FormioExport {

  /**
   * Creates an instance of FormioExport.
   * @param {any} component The formio component
   * @param {any} data The formio component data
   * @param {any} [options={}] Formio optional parameters
   * @memberof FormioExport
   */
  constructor (pdfArray) {

    if (!(this instanceof FormioExport)) {
      return new FormioExport(pdfArray);
    }

    this.component = null;
    this.data = [];
    this.options = {};
    this.structure = [];

    _.each(pdfArray, (value, key) => {
      this.component = value.component;
      this.data = value.submission;
      this.options = value.option;

      if (this.component) {
        if (FormioExportUtils.isFormioForm(this.component) || FormioExportUtils.isFormioWizard(this.component)) {
          this.component.type = 'form';
          this.component.display = 'form';
        }
        _.each(this.data, (value, key) => {
          if (FormioExportUtils.isFormioSubmission(value)) {
            this.options.submission = {
              id: value._id,
              owner: value.owner,
              modified: value.modified
            };
          }
          this.structure.push(FormioComponent.create(this.component, value.data, this.options));
        });
      } else if (!this.component) {
        console.warn(this.constructor.name, 'no component defined');
      }

    });
  }

  /**
   * Renders the formio component to HTML
   *
   * @returns {Promise} The promise containing the HTML render of the formio component
   * @memberof FormioExport
   */
  toHtml () {
    return new Promise((resolve, reject) => {
      try {
        toHtml(this.structure).then((html) => resolve(html));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Exports the formio component to a jsPDF object
   *
   * @param {any} [config={}] The Html2PDf configuration
   * @returns {Promise} The promise containing the jsPDF object
   * @memberof FormioExport
   */
  toPdf (config = {}) {
    return new Promise((resolve, reject) => {
      try {
        this.toHtml().then((source) => {
          toPdf(Object.assign(config, { source: source })).then((pdf) => resolve(pdf));
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Exports the formio component to a xlsx object
   *
   * @param {any} [config={}] The xlsx configuration
   * @returns {Promise} The promise containing the xlsx object
   * @memberof FormioExport
   */
  toXlsx (config = {}) {
    return new Promise((resolve, reject) => {
      try {
        toXlsx(config).then((xlsx) => resolve(xlsx));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Renders the formio component to HTML
   *
   * @param {any} options The FormioExport options
   * @returns {Promise} The promise containing the HTML render of the formio component
   * @memberof FormioExport
   */
  static toHtml (options) {
    return new Promise((resolve, reject) => {
      try {
        options = FormioExportUtils.verifyProperties(options, {
          component: {
            type: Object,
            required: true
          },
          formio: {
            type: Object
          }
        });
        (new FormioExport(options.component, options.data, options.formio)).toHtml().then((html) => {
          resolve(html);
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  }

  /**
   * Exports the formio component to a jsPDF object
   *
   * @param {any} options The FormioExport configuration
   * @returns {Promise} The promise containing the jsPDF object
   * @memberof FormioExport
   */
  static toPdf (options) {
    return new Promise((resolve, reject) => {
      try {
        options = FormioExportUtils.verifyProperties(options, {
          component: {
            type: Object,
            required: true
          },
          formio: {
            type: Object
          },
          config: {
            type: Object,
            default: {
              filename: `export-${Math.random().toString(36).substring(7)}.pdf`
            }
          }
        });
        (new FormioExport(options.component, options.data, options.formio)).toPdf(options.config).then((pdf) => {
          resolve(pdf);
        });

      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  }

  /**
   * Exports the formio component to a xlsx object
   *
   * @param {any} options The FormioExport configuration
   * @returns {Promise} The promise containing the xlsx object
   * @memberof FormioExport
   */
  static toXlsx (options) {
    return new Promise((resolve, reject) => {
      try {
        options = FormioExportUtils.verifyProperties(options, {
          component: {
            type: Object,
            required: true
          },
          formio: {
            type: Object
          },
          config: {
            type: Object
          }
        });
        (new FormioExport(options.component, options.data, options.formio)).toXlsx(options.config).then((xlsx) => {
          resolve(xlsx);
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  }
};

export default FormioExport;
