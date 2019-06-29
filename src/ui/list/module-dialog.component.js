import { h, Component } from "preact";

export default class ModuleDialog extends Component {
  getInitialOverrideUrl = () => {
    const regex = new RegExp(
      `//localhost:([0-9]+)/${defaultFileName(this.props.module.moduleName)}`
    );
    const match = regex.exec(this.props.module.overrideUrl);
    if (match) {
      return match[1];
    } else if (this.props.module.overrideUrl) {
      return this.props.module.overrideUrl;
    } else {
      return "";
    }
  };
  state = {
    overrideUrl: this.getInitialOverrideUrl(),
    moduleName: ""
  };
  inputEl = null;
  moduleNameEl = null;
  componentDidMount() {
    this.focusFirstInput();
    this.dialogEl.addEventListener("keydown", this.keyDown);
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.module !== prevProps.module) {
      this.setState(
        { overrideUrl: this.props.module.overrideUrl || "" },
        () => {
          this.focusFirstInput();
        }
      );
    }
  }
  componentWillUnmount() {
    this.dialogEl.removeEventListener("keydown", this.keyDown);
  }
  render({ module }) {
    return (
      <div className="imo-modal-container">
        <div className="imo-modal" />
        <dialog
          className={`imo-module-dialog ${
            this.state.overrideUrl.length > 0 ? "imo-overridden" : "imo-default"
          }`}
          open
          ref={this.dialogRef}
        >
          <form method="dialog" onSubmit={this.handleSubmit}>
            <h3 style={{ marginTop: 0 }}>{module.moduleName}</h3>
            <table>
              <tbody>
                {!module.isNew && (
                  <tr>
                    <td>Default URL:</td>
                    <td>{module.defaultUrl}</td>
                  </tr>
                )}
                {module.isNew && (
                  <tr>
                    <td>
                      <span id="module-name-label">Module Name:</span>
                    </td>
                    <td style={{ position: "relative" }}>
                      <input
                        type="text"
                        value={this.state.moduleName}
                        aria-labelledby="module-name-label"
                        onInput={evt =>
                          this.setState({ moduleName: evt.target.value })
                        }
                        ref={this.handleModuleNameRef}
                        required
                      />
                      <div
                        role="button"
                        tabIndex={0}
                        className="imo-clear-input"
                        onClick={this.clearModuleName}
                      >
                        <div>{"\u24E7"}</div>
                      </div>
                    </td>
                  </tr>
                )}
                <tr>
                  <td>
                    <span id="override-url-label">Override URL:</span>
                  </td>
                  <td style={{ position: "relative" }}>
                    <input
                      ref={this.handleInputRef}
                      type="text"
                      value={this.state.overrideUrl}
                      aria-labelledby="override-url-label"
                      onInput={evt =>
                        this.setState({ overrideUrl: evt.target.value })
                      }
                    />
                    <div
                      role="button"
                      tabIndex={0}
                      className="imo-clear-input"
                      onClick={this.clearInput}
                    >
                      <div>{"\u24E7"}</div>
                    </div>
                  </td>
                </tr>
                {portRegex.test(this.state.overrideUrl) && (
                  <tr>
                    <td>Derived url:</td>
                    <td>{this.getDerivedUrl()}</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="imo-dialog-actions">
              <button
                type="button"
                onClick={this.props.cancel}
                style={{ marginRight: "16px" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={
                  this.state.overrideUrl ? "imo-overridden" : "imo-default"
                }
              >
                {this.state.overrideUrl ? "Apply override" : "Reset to default"}
              </button>
            </div>
          </form>
        </dialog>
      </div>
    );
  }

  handleInputRef = el => {
    this.inputEl = el;
  };

  handleModuleNameRef = el => {
    this.moduleNameEl = el;
  };

  dialogRef = el => {
    this.dialogEl = el;
  };

  handleSubmit = evt => {
    evt.preventDefault();
    const fullUrl = this.getDerivedUrl();
    if (this.props.module.isNew) {
      this.props.addNewModule(this.state.moduleName, fullUrl);
    } else {
      this.props.updateModuleUrl(fullUrl);
    }
  };

  getDerivedUrl = () => {
    const moduleName = this.props.module.isNew
      ? this.state.moduleName
      : this.props.module.moduleName;
    return portRegex.test(this.state.overrideUrl)
      ? `//localhost:${this.state.overrideUrl}/${defaultFileName(moduleName)}`
      : this.state.overrideUrl;
  };

  keyDown = evt => {
    if (evt.key === "Escape") {
      evt.stopPropagation();
      this.props.cancel();
    }
  };

  focusFirstInput = () => {
    const firstInput = this.moduleNameEl || this.inputEl;
    firstInput.select();
  };

  clearModuleName = () => {
    this.setState({ moduleName: "" }, () => {
      this.focusFirstInput();
    });
  };

  clearInput = () => {
    this.setState({ overrideUrl: "" }, () => {
      this.focusFirstInput();
    });
  };
}

const portRegex = /^\d+$/;
const scopedPkgRegex = /^@.+\/.+$/;

function defaultFileName(name) {
  if (scopedPkgRegex.test(name)) {
    name = name.slice(name.indexOf("/") + 1);
  }

  return name.replace(/\//g, "") + ".js";
}
