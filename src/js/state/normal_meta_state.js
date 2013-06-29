/**
 * ステートモジュール
 *
 * @module excel/state
 */
define(['jquery', 'config', 'util', 'state/abstract_state' ], function ($, config, util, AbstractState) {

	/**
	 * 通常 + メタ ステートクラス
	 *
	 * @class NormalMetaState
	 * @constructor
	 * @extends AbstractState
	 */
	var NormalMetaState = function (stateCtx, view) {
		this.name = 'NormalMetaState';
		this.stateCtx = stateCtx;
		this.view = view;
	};
	$.extend(NormalMetaState.prototype, AbstractState.prototype, {
		keyup  : function (e) {
			var view = this.view;

			if (!e.metaKey && !e.originalEvent.ctrlKey) {
				this.stateCtx.transState('normal_state', view);
			}
		},
		keydown  : function (e) {
			var view = this.view;

			if (e.keyCode == this.META_KEY.SHIFT) {
				this.stateCtx.transState('normal_shift_meta_state', view);
				return;
			}

			var changeSelectedCell = false,
				currentPos = view.getSelectedFirstPos();

			switch(e.keyCode) {

				// select all
				case this.ALP_KEY.A:
					view.selectStartCellPos[0] = 0;
					view.selectStartCellPos[1] = 0;
					view.selectEndCellPos[0] = view.lastCellPos[0];
					view.selectEndCellPos[1] = view.lastCellPos[1];
					this._updateActiveRange(view.selectStartCellPos, view.selectEndCellPos);
					e.preventDefault();
					break;

				// copy
				case this.ALP_KEY.C:
					clipboard.id = new Date().getTime();
					clipboard.data = view.getSelectedData();

					view.$textarea
						.addClass(config.cls.EDITING)
						.val(clipboard.id)
						.focus()
						.select();

					break;

				// cut
				case this.ALP_KEY.X:
					clipboard.id = new Date().getTime();
					clipboard.data = $.extend(true, [], view.getSelectedData());

					$(document).trigger('delete' + config.event.NAMESPACE);

					view.$textarea
						.addClass(config.cls.EDITING)
						.val(clipboard.id)
						.focus()
						.select();

					break;

				// paste
				case this.ALP_KEY.V:
					view.startEditing(0);
					break;

				// undo
				case this.ALP_KEY.Z:
					e.preventDefault();
					$(document).trigger('undo' + config.event.NAMESPACE);
					break;

				// reload
				case this.ALP_KEY.R:
					e.preventDefault();
					$(document).trigger('reload' + config.event.NAMESPACE);
					break;

				// Cmd + Arrow Key
				case this.META_KEY.UP:
					currentPos[0] = 0;
					changeSelectedCell = true;
					break;

				// Cmd + Arrow Key
				case this.META_KEY.DOWN:
					currentPos[0] = view.lastCellPos[0];
					changeSelectedCell = true;
					break;

				// Cmd + Arrow Key
				case this.META_KEY.LEFT:
					currentPos[1] = 0;
					changeSelectedCell = true;
					break;

				// Cmd + Arrow Key
				case this.META_KEY.RIGHT:
					currentPos[1] = view.lastCellPos[1];
					changeSelectedCell = true;
					break;
				
				default:
			}

			if (changeSelectedCell) {
				e.preventDefault();
				this._updateActiveUniqCell(currentPos);
			}
		}
	});

	return NormalMetaState;
});
