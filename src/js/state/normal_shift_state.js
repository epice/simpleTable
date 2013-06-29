/**
 * ステートモジュール
 *
 * @module excel/state
 */
define(['jquery', 'config', 'util', 'state/abstract_state' ], function ($, config, util, AbstractState) {

	/**
	 * 通常 + シフト ステートクラス
	 *
	 * @class NormalShiftState
	 * @constructor
	 * @extends AbstractState
	 */
	var NormalShiftState = function (stateCtx, view) {
		this.name = 'NormalShiftState';
		this.stateCtx = stateCtx;
		this.view = view;
	};
	$.extend(NormalShiftState.prototype, AbstractState.prototype, {
		keyup  : function (e) {
			var view = this.view;

			if (!e.shiftKey) {
				this.stateCtx.transState('normal_state', view);
			}
		},
		keydown  : function (e) {
			var view = this.view;

			if (e.keyCode == this.META_KEY.COMMAND) {
				this.stateCtx.transState('normal_shift_meta_state', view);
				return;
			}

			var changeSelectedCell = false,
				currentPos = view.getSelectedFirstPos();

			if (!view.selectStartCellPos) {
				view.selectStartCellPos = [parseInt(currentPos[0], 10), parseInt(currentPos[1], 10)];
				view.selectEndCellPos   = [parseInt(currentPos[0], 10), parseInt(currentPos[1], 10)];
			}

			var posY = parseInt(view.selectEndCellPos[0], 10),
				posX = parseInt(view.selectEndCellPos[1], 10);

			switch(e.keyCode) {
				case this.META_KEY.UP:
					if (posY - 1 >= 0) {
						view.selectEndCellPos[0] = posY - 1;
						changeSelectedCell = true;
					}
					break;
				
				case this.META_KEY.DOWN:
					if (view.lastCellPos[0] >= posY + 1) {
						view.selectEndCellPos[0] = posY + 1;
						changeSelectedCell = true;
					}
					break;
				
				case this.META_KEY.LEFT:
					if (posX - 1 >= 0) {
						view.selectEndCellPos[1] = posX - 1;
						changeSelectedCell = true;
					}
					break;
				
				case this.META_KEY.RIGHT:
				case this.META_KEY.TAB:
					if (view.lastCellPos[1] >= posX + 1) {
						view.selectEndCellPos[1] = posX + 1;
						changeSelectedCell = true;
					}
					break;
				
				default:

			}

			if (changeSelectedCell) {
				this._updateActiveRange(view.selectStartCellPos, view.selectEndCellPos);
			}
		},
		click: function (e, $el) {
			var view = this.view;

			if (!$el.hasClass(config.cls.SELECTED)) {

				var clickedCellPos = $el.attr(config.attr.CELL_ID).split(':'),
					currentPos = view.getSelectedFirstPos();

				if (!view.selectStartCellPos) {
					view.selectStartCellPos = [parseInt(currentPos[0], 10), parseInt(currentPos[1], 10)];
				}

				view.selectEndCellPos[0] = clickedCellPos[0];
				view.selectEndCellPos[1] = clickedCellPos[1];
				this._updateActiveRange(view.selectStartCellPos, view.selectEndCellPos);
				e.preventDefault();
			}
		}
	});

	return NormalShiftState;
});
