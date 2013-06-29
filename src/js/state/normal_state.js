/**
 * ステートモジュール
 *
 * @module excel/state
 */
define(['jquery', 'config', 'util', 'state/abstract_state' ], function ($, config, util, AbstractState) {

	/**
	 * 通常 ステートクラス
	 *
	 * @class NormalState
	 * @constructor
	 * @extends AbstractState
	 */
	var NormalState = function (stateCtx, view) {
		this.name = 'NormalState';
		this.stateCtx = stateCtx;
		this.view = view;
		this.view.finishEditing();
	};

	$.extend(NormalState.prototype, AbstractState.prototype, {
		keydown: function (e) {
			var view = this.view;

			if (e.shiftKey) {
				this.stateCtx.transState('normal_shift_state', view);
				return;
			}
			if (e.metaKey || e.originalEvent.ctrlKey) {
				this.stateCtx.transState('normal_meta_state', view);
				return;
			}
			e.preventDefault();

			var changeSelectedCell = false,
				currentPos = view.getSelectedFirstPos(),
				posY = parseInt(currentPos[0], 10),
				posX = parseInt(currentPos[1], 10);

			switch(e.keyCode) {
				case this.META_KEY.ENTER:
					if (util.checkArrayEquality(view.selectStartCellPos, view.selectEndCellPos)) {
						if ( !view.getSelectedFirstCell().hasClass(config.cls.DISABLED)) {
						// 単一選択時のみ編集モードに変更
							this.stateCtx.transState('edit_state', view);
							return;
						}
					}
					break;
				
				case this.META_KEY.UP:
					if (posY - 1 >= 0) {
						currentPos[0] = posY - 1;
						changeSelectedCell = true;
					}
					break;
				
				case this.META_KEY.DOWN:
					if (view.lastCellPos[0] >= posY + 1) {
						currentPos[0] = posY + 1;
						changeSelectedCell = true;
					}
					break;
				
				case this.META_KEY.LEFT:
					if (posX - 1 >= 0) {
						currentPos[1] = posX - 1;
						changeSelectedCell = true;
					}
					break;
				
				case this.META_KEY.RIGHT:
				case this.META_KEY.TAB:
					if (view.lastCellPos[1] >= posX + 1) {
						currentPos[1] = posX + 1;
						changeSelectedCell = true;
					}
					break;
				
				case this.META_KEY.DELETE:
				case this.META_KEY.BACKSPACE:
					$(document).trigger('delete' + config.event.NAMESPACE);
					break;
				
				default:
					if (util.checkArrayEquality(view.selectStartCellPos, view.selectEndCellPos)) {
						if ( !view.getSelectedFirstCell().hasClass(config.cls.DISABLED)) {
							// 単一選択時のみ編集モードに変更
							this.stateCtx.transState('edit_state', view);
							return;
						}
					}
			}

			if (changeSelectedCell) {
				this._updateActiveUniqCell(currentPos);
			}
		},
		click: function (e, $el) {
			var view = this.view;

			if (e.target.nodeName.toLowerCase() != 'textarea') {
				if (
					$el.hasClass(config.cls.SELECTION_AREA) ||
					$el.hasClass(config.cls.SELECTED)
				) {
					if (
						!$el.hasClass(config.cls.DISABLED) &&
						!view.getSelectedFirstCell().hasClass(config.cls.DISABLED)
					) {
						if (util.checkArrayEquality(view.selectStartCellPos, view.selectEndCellPos)) {
							// 自身が選択中なら編集モード
							this.stateCtx.transState('edit_state', view);
						}
					}

				} else { 
					var currentPos = $el.attr(config.attr.CELL_ID).split(':');
					this._updateActiveUniqCell(currentPos, false);
				}
			}
		},
		mousedown: function (e) {
			var view = this.view;
			this.stateCtx.transState('normal_mousedown_state', view);
		}
	});

	return NormalState;
});
