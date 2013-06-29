/**
 * ステートモジュール
 *
 * @module excel/state
 */
define(['jquery', 'config', 'util', 'state/abstract_state' ], function ($, config, util, AbstractState) {

	/**
	 * 編集不可 ステートクラス
	 *
	 * @class LockState
	 * @constructor
	 * @extends AbstractState
	 */
	var LockState = function (stateCtx, view) {
		this.name = 'LockState';
		this.stateCtx = stateCtx;
		this.view = view;
	};
	$.extend(LockState.prototype, AbstractState.prototype, {
	});

	return LockState;
});
