/**
 * ステートモジュール
 *
 * @module excel/state
 */
define(['jquery', 'config', 'util', 'state/abstract_state' ], function ($, config, util, AbstractState) {

	/**
	 * 通常 + シフト + メタ ステートクラス
	 *
	 * @class NormalShiftMetaState
	 * @constructor
	 * @extends AbstractState
	 */
	var NormalShiftMetaState = function (stateCtx, view) {
		this.name = 'NormalShiftMetaState';
		this.stateCtx = stateCtx;
		this.view = view;
	};
	$.extend(NormalShiftMetaState.prototype, AbstractState.prototype, {
		keyup  : function (e) {
			var view = this.view;

			if (!e.shiftKey && !e.metaKey && !e.originalEvent.ctrlKey) {
				this.stateCtx.transState('normal_state', view);
			} else if (!e.shiftKey) {
				this.stateCtx.transState('normal_meta_state', view);
			} else if (!e.metaKey && !e.originalEvent.ctrlKey) {
				this.stateCtx.transState('normal_shift_state', view);
			}
		},
		keydown  : function (e) {
			var view = this.view;

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
					view.selectEndCellPos[0] = 0;
					changeSelectedCell = true;
					break;
				
				case this.META_KEY.DOWN:
					view.selectEndCellPos[0] = view.lastCellPos[0];
					changeSelectedCell = true;
					break;
				
				case this.META_KEY.LEFT:
					view.selectEndCellPos[1] = 0;
					changeSelectedCell = true;
					break;
				
				case this.META_KEY.RIGHT:
				case this.META_KEY.TAB:
					view.selectEndCellPos[1] = view.lastCellPos[1];
					changeSelectedCell = true;
					break;
				
				case this.ALP_KEY.V:
					e.preventDefault();
					$(document).trigger('paste' + config.event.NAMESPACE);
					break;
				
				default:

			}

			if (changeSelectedCell) {
				this._updateActiveRange(view.selectStartCellPos, view.selectEndCellPos);
			}
		}
	});

	return NormalShiftMetaState;
});
