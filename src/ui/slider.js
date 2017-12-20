import Widget from "ui/core/widget";
import Constraint from "util/constraint";
import ConstraintSpec from "util/constraint-def";

/**
 * Class representing a Slider widget.
 * @class
 * @implements {Widget}
 */
class Slider extends Widget {

  /**
   * @constructor
   * @param {object} container - DOM container for the widget.
   * @param {object} [o] - Options.
   * @param {number} [o.minVal=0] - The minimum possible value the slider can represent.
   * @param {number} [o.maxVal=127] - The maximum possible value teh slider can represent.
   * @param {string} [o.sliderBodyColor="#484848"] - The color of the slider bar.
   * @param {string} [o.sliderHandleColor="#484848"] - The color of the triangle used as the slider's needle.
   */
  constructor(container, o) {
    super(container, o);
  }

  /* ===========================================================================
  *  INITIALIZATION METHODS
  */

  /**
   * Initialize the options
   * @override
   * @protected
   */
  _initOptions(o) {
    // set the defaults
    this.o = {
      minVal: 0,
      maxVal: 127,
      sliderBodyColor: "#484848",
      sliderHandleColor: "#484848",
      mouseSensitivity: 1.2
    };

    // override defaults with provided options
    super._initOptions(o);
  }

  /**
   * Initialize state constraints
   * @override
   * @protected
   */
  _initStateConstraints() {
    const _this = this;

    this.stateConstraints = new ConstraintSpec({
      val: new Constraint({ min: _this.o.minVal, max: _this.o.maxVal, transform: (num) => num.toFixed(0) })   
    });
  }

  /**
   * Initialize state.
   * @override
   * @protected
   */
  _initState() {
    this.state = {
      val: this.o.minVal
    };

    // keep track of dimensions
    this.dims = {
      offsetBottom: 5,
      offsetTop: 5,
      bodyWidth: 2,
      handleWidth: 10,
      handleHeight: 10
    };
  }

  /**
   * Initialize the svg elements
   * @override
   * @protected
   */
  _initSvgEls() {
    const _this = this;

    this.svgEls = {
      body: document.createElementNS(_this.SVG_NS, "rect"),
      overlay: document.createElementNS(_this.SVG_NS, "rect"),
      handle: document.createElementNS(_this.SVG_NS, "polygon")
    };

    this._appendSvgEls();
    this._update();
  }

  /**
   * Initialize mouse and touch event handlers
   * @override
   * @protected
   */
  _initHandlers() {
    const _this = this;

    this.handlers = {

      touchBody: function touchBody(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        let newVal = _this._calcTouchVal(ev.clientY);
        _this.setState({ val: newVal });
        
        _this.handlers.touchHandle(ev);
      },

      touchHandle: function touchHandle(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        
        document.body.addEventListener("mousemove", _this.handlers.moveHandle);
        document.body.addEventListener("touchmove", _this.handlers.moveHandle);
        document.body.addEventListener("mouseup", _this.handlers.releaseHandle); 
        document.body.addEventListener("touchend", _this.handlers.releaseHandle); 
      },

      moveHandle: function moveHandle(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        let newVal = _this._calcTouchVal(ev.clientY);
        _this.setState({ val: newVal });
      },

      releaseHandle: function releaseHandle(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        document.body.removeEventListener("touchmove", _this.handlers.moveHandle); 
        document.body.removeEventListener("mousemove", _this.handlers.moveHandle);
        document.body.removeEventListener("mouseup", _this.handlers.releaseHandle); 
        document.body.removeEventListener("touchend", _this.handlers.releaseHandle); 
      }
    };

    this.svgEls.overlay.addEventListener("mousedown", _this.handlers.touchBody);
    this.svgEls.overlay.addEventListener("touchstart", _this.handlers.touchBody);
    this.svgEls.handle.addEventListener("mousedown", _this.handlers.touchHandle);
    this.svgEls.handle.addEventListener("touchstart", _this.handlers.touchHandle);
  }

  /**
   * Update (redraw) component based on state
   * @override
   * @protected
   */
  _update() {
    const _this = this;

    let sliderBodyPos = _this._calcSliderBodyPos();

    this.svgEls.body.setAttribute("x", sliderBodyPos.x);
    this.svgEls.body.setAttribute("y", sliderBodyPos.y);
    this.svgEls.body.setAttribute("width", _this.dims.bodyWidth);
    this.svgEls.body.setAttribute("height", _this._calcSliderBodyHeight());
    this.svgEls.body.setAttribute("fill", _this.o.sliderBodyColor);

    this.svgEls.overlay.setAttribute("x", sliderBodyPos.x);
    this.svgEls.overlay.setAttribute("y", sliderBodyPos.y);
    this.svgEls.overlay.setAttribute("width", _this.dims.bodyWidth + _this.dims.handleWidth);
    this.svgEls.overlay.setAttribute("height", _this._calcSliderBodyHeight());
    this.svgEls.overlay.setAttribute("fill", "transparent");

    let sliderHandlePoints = _this._calcSliderHandlePoints();

    this.svgEls.handle.setAttribute("points", sliderHandlePoints);
    this.svgEls.handle.setAttribute("fill", _this.o.sliderHandleColor);
  }

  /* ===========================================================================
  *  PUBLIC API
  */

  /**
   * Get the slider value.
   * @public
   */
  getVal() {
    return this.state.val;
  }

  /**
   * Set the current slider value.
   * Same as setVal(), but will not cause an observer callback trigger.
   * @public
   * @param {number} newVal - The new slider value.
   */
  setInternalVal(newVal) {
    this.setInternalState({ val: newVal });
  }

  /**
   * Set the current slider value.
   * Same as setInternalVal(), but will cause an observer callback trigger.
   * @public
   * @param {number} newVal - The new slider value.
   */
  setVal(newVal) {
    this.setState({ val: newVal });
  }

  /* ===========================================================================
  *  HELPER METHODS
  */

  /**
   * Returns the position and dimensions for the slider body.
   * @private
   * @returns {object} - {x, y} position.
   */
  _calcSliderBodyPos() {
    const _this = this;

    return {
      x: _this._getWidth() / 2 - 1,
      y: _this.dims.offsetTop
    };
  }

  /**
   * Returns the height of the slider body.
   * @private
   * @returns {number} - Height of the slider body.
   */
  _calcSliderBodyHeight() {
    return this._getHeight() - this.dims.offsetTop - this.dims.offsetBottom;
  }

  /**
   * Returns the height of the slider body.
   * @private
   * @returns {number} - Width of the slider body.
   */
  _calcSliderBodyWidth() {
    return this.dims.bodyWidth;
  }

    /**
   * Returns the position and dimensions for the slider body.
   * @private
   * @returns {object} - {x, y} position.
   */
  _calcSliderHandlePoints() {
    const _this = this;

    let sliderBodyHeight = _this._calcSliderBodyHeight();

    let x0 = (_this._getWidth() / 2) + 1;
    let y0 = (sliderBodyHeight - (_this.state.val / (_this.o.maxVal - _this.o.minVal)) * sliderBodyHeight) + _this.dims.offsetBottom;
    let x1 = x0 + this.dims.handleWidth;
    let y1 = y0 - this.dims.handleHeight / 2;
    let x2 = x1;
    let y2 = y0 + this.dims.handleHeight / 2;

    return x0 + "," + y0 + " " +
           x1 + "," + y1 + " " +
           x2 + "," + y2;
  }

  /**
   * Calculate the value of the slider touched at position y.
   * @private
   * @param {number} y - Y-value of the touch location.
   * @returns {number} - Value of the slider at the touched location.
   */
  _calcTouchVal(y) {
    let valRange = this.o.maxVal - this.o.minVal;
    let bodyY = (this._getHeight() - this._getRelativeY(y)) - this.dims.offsetBottom;
    let touchVal = ((bodyY / this._calcSliderBodyHeight()) * valRange) + this.o.minVal; 
    
    return touchVal;
  }
}

export default Slider;
