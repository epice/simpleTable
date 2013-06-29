/**
 * ステートモジュール
 *
 * @module excel/state
 */
define(['jquery', 'config', 'util', 'state/abstract_state' ], function ($, config, util, AbstractState) {

	/**
	 * 通常 + マウスダウン ステートクラス
	 *
	 * @class NormalMousedownState
	 * @constructor
	 * @extends AbstractState
	 */
	var NormalMousedownState = function (stateCtx, view) {
		this.name = 'NormalMousedownState';
		this.stateCtx = stateCtx;
		this.view = view;
	};
	$.extend(NormalMousedownState.prototype, AbstractState.prototype, {
		mousemove: function (e, $el) {
			var view = this.view,
				mouseoverCellPos = $el.attr(config.attr.CELL_ID).split(':'),
				currentPos = view.getSelectedFirstPos();

			if (!view.selectStartCellPos) {
				view.selectStartCellPos = [parseInt(currentPos[0], 10), parseInt(currentPos[1], 10)];
			}

			view.selectEndCellPos[0] = mouseoverCellPos[0];
			view.selectEndCellPos[1] = mouseoverCellPos[1];
			this._updateActiveRange(view.selectStartCellPos, view.selectEndCellPos);
			e.preventDefault();

		},
		mouseup: function (e) {
			var view = this.view;
			this.stateCtx.transState('normal_state', view);
		}
	});

	return NormalMousedownState;
});
